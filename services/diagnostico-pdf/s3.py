"""Upload do PDF pro S3. Infra AWS (mesmo modelo do quiz OAB): `configurado()`
só exige BUCKET_NAME e REGION; sem ACCESS_KEY/SECRET_KEY o boto3 usa a cadeia
padrão de credenciais (IAM role da tarefa/pod), que é o caminho de produção.
ACCESS_KEY/SECRET_KEY ficam como fallback opcional pra dev local (MinIO), e
S3_ENDPOINT aponta pro MinIO local (vazio na AWS). Sem BUCKET_NAME, quem chama
(main.py) pula o upload sem tratar como erro.
"""
import os
from functools import lru_cache

def configurado() -> bool:
    return bool(os.environ.get("BUCKET_NAME") and os.environ.get("REGION"))


@lru_cache(maxsize=1)
def _cliente():
    import boto3
    from botocore.config import Config

    # Timeouts curtos e poucas tentativas (defaults do boto3: 60s de
    # connect+read, retry legado até 5x) — sem isso, um S3/endpoint que
    # trava deixa a put_object presa por minutos. Já roda em thread separada
    # (ver upload_pdf), então "só" atrasa aquele upload, mas não faz sentido
    # deixar mais longo que o timeout de 55s que o lado Next.js já usa pra
    # desistir dessa chamada (ver lib/server/diagnosticoService.ts).
    kw: dict = {"region_name": os.environ["REGION"]}
    if os.environ.get("S3_ENDPOINT"):
        kw["endpoint_url"] = os.environ["S3_ENDPOINT"]
        cfg = Config(connect_timeout=5, read_timeout=20, retries={"max_attempts": 2}, s3={"addressing_style": "path"})
    else:
        cfg = Config(connect_timeout=5, read_timeout=20, retries={"max_attempts": 2})
    if os.environ.get("ACCESS_KEY") and os.environ.get("SECRET_KEY"):
        kw["aws_access_key_id"] = os.environ["ACCESS_KEY"]
        kw["aws_secret_access_key"] = os.environ["SECRET_KEY"]
    return boto3.client("s3", config=cfg, **kw)


async def upload_pdf(session_token: str, pdf_bytes: bytes, prefixo: str = "laudos") -> str:
    """Sobe o PDF pro S3 sob uma chave estável (session_token) — reenviar o
    diagnóstico (ou a apresentação, ver `prefixo`) do mesmo lead sobrescreve o
    objeto em vez de acumular versões soltas. Deixa a exceção do boto3 subir
    pra quem chamou decidir o que fazer com a falha; só chame depois de
    conferir `configurado()`.

    boto3 é síncrono — chamado direto dentro do `async def` de main.py,
    put_object bloquearia o event loop inteiro do uvicorn (um processo só)
    até terminar ou dar timeout, travando toda outra requisição em voo
    (outros diagnósticos, /health) junto. `asyncio.to_thread` tira a chamada de
    rede do loop principal.
    """
    import asyncio

    bucket = os.environ["BUCKET_NAME"]
    key = f"{prefixo}/{session_token}.pdf"
    cliente = _cliente()
    await asyncio.to_thread(cliente.put_object, Bucket=bucket, Key=key, Body=pdf_bytes, ContentType="application/pdf")
    return key
