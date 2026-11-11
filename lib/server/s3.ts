// URL assinada pro PDF do diagnóstico guardado no S3 (ver services/diagnostico-pdf/s3.py,
// quem sobe o objeto). Usado só por app/api/laudo/[token]/route.ts — o link
// estável que vai pro CRM nunca expira porque gera uma URL nova a cada
// acesso; essa aqui é a de curta duração, só pro tempo do redirect.
//
// Infra AWS (mesmo modelo do quiz OAB): só BUCKET_NAME e REGION são
// obrigatórias. Sem ACCESS_KEY/SECRET_KEY o SDK usa a cadeia padrão de
// credenciais (IAM role da tarefa/pod) — o caminho de produção. As duas ficam
// como fallback opcional pra dev local (MinIO). S3_PUBLIC_ENDPOINT (ou
// S3_ENDPOINT) só existe pro MinIO local: é o host que o NAVEGADOR enxerga na
// URL assinada; vazio na AWS.
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

export function s3Configurado(): boolean {
  return Boolean(process.env.BUCKET_NAME && process.env.REGION)
}

function cliente(): S3Client {
  const endpoint = process.env.S3_PUBLIC_ENDPOINT || process.env.S3_ENDPOINT || undefined
  const { ACCESS_KEY: accessKeyId, SECRET_KEY: secretAccessKey } = process.env
  return new S3Client({
    region: process.env.REGION,
    ...(endpoint ? { endpoint, forcePathStyle: true } : {}),
    ...(accessKeyId && secretAccessKey ? { credentials: { accessKeyId, secretAccessKey } } : {}),
  })
}

// 5 minutos: tempo de sobra pro navegador seguir o redirect, sem deixar a
// URL assinada viva por mais tempo do que o necessário caso vaze de algum
// jeito (log, proxy, etc.) — bem menor que o teto de 7 dias do protocolo.
const EXPIRA_EM_SEGUNDOS = 300

export async function urlAssinadaDoDiagnostico(s3Key: string): Promise<string> {
  const bucket = process.env.BUCKET_NAME
  if (!bucket) throw new Error('BUCKET_NAME não configurado')
  const comando = new GetObjectCommand({ Bucket: bucket, Key: s3Key })
  return getSignedUrl(cliente(), comando, { expiresIn: EXPIRA_EM_SEGUNDOS })
}
