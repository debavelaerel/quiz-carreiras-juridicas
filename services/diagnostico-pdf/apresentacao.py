"""Personalização da apresentação comercial (deck de call 1:1, 22 telas) —
vendor/vde-tribunais-call/deck.html, hoje com o conteúdo do VDE Carreiras
Jurídicas (a pasta manteve o nome antigo só pra não mexer em main.py).

O deck é HTML fixo com ~30 pontos marcados `data-var="chave"` — cada um já vem
preenchido com o valor de um lead de exemplo (Rafael). Este módulo calcula o
valor de cada `data-var` a partir dos dados brutos do quiz, reaproveitando o
MESMO pacote (diagnosis/) usado no diagnóstico — o deck e o diagnóstico
descrevem o mesmo lead, então usam a mesma fonte de verdade (profile.py,
blocks.py), não duas.

Onde o deck precisa de uma frase que não é só o rótulo cru da pergunta (ex.:
"Fico perto do corte..." na tela do quiz vira "Fica perto do corte..." na boca
do consultor, falando do lead na 3ª pessoa), a transformação está numa tabela
pequena e explícita por valor — nunca um regex genérico de conjugação — pra
ficar fácil de auditar e corrigir uma frase por vez.
"""
from html import escape as _esc

from diagnosis.answers import Lead
from diagnosis.blocks import BLOCKS
from diagnosis.profile import ALVOS, MOMENTOS, RITMOS, profile
from diagnosis.questions import TEST

# ---- grade do curso (tela 6) ------------------------------------------
# Formação de Base: 23 disciplinas e 420+ temas (página oficial do produto).
# A página não lista as 23 por nome; a lista abaixo é só a das disciplinas que
# têm professor na página (conferida em 11/11/2026). PENDENTE: confirmar com o
# time a lista completa das 23 e quais são as 8 principais.
GRADE = {
    "disciplinas_total": 23,
    "temas": "420+",
    "disciplinas": [
        "Constitucional.", "Administrativo.", "Civil.", "Processo Civil.",
        "Penal.", "Processo Penal.", "Empresarial.", "Tributário.",
        "Financeiro.", "Consumidor.", "Ambiental.", "Trabalho.",
        "Processo do Trabalho.", "Direitos Humanos.",
        "Internacional.", "Criminologia.", "Eleitoral.", "ECA.",
    ],
}
# Disciplinas em dourado na grade, por alvo. Sem regra específica, destaca o
# núcleo que a própria página do produto cita ("Constitucional,
# Administrativo, Civil, Penal e mais").
_DESTAQUE_PADRAO = ("Constitucional.", "Administrativo.", "Civil.", "Penal.")
_DESTAQUE_DELEGADO = ("Penal.", "Processo Penal.", "Criminologia.")
_DESTAQUE_TRABALHO = ("Trabalho.", "Processo do Trabalho.")

# ---- gargalo declarado (tela 3) ----------------------------------------
# Título: eco em 3ª pessoa da opção que o lead marcou no quiz. Corpo: os dois
# parágrafos de blocks.py (grupo "O maior gargalo declarado") — a MESMA copy
# que já vai pro diagnóstico de todo lead, só reaproveitada aqui.
_DOR_TITULO = {
    "base": 'Você disse que <span class="ul">não tem base</span>: sente que começa do zero a cada edital.',
    "improviso": 'Você disse que estuda <span class="ul">no improviso</span>, sem cronograma nem ordem.',
    "tempo": 'Você disse que tem <span class="ul">pouco tempo</span>: concilia estudo com trabalho.',
    "discursiva": 'Você disse que <span class="ul">trava na discursiva</span>, na peça ou na sentença.',
    "fixar": 'Você disse que <span class="ul">lê muito e resolve pouco</span>: não fixa.',
    "juris": 'Você disse que não dá conta de acompanhar <span class="ul">jurisprudência e informativos</span>.',
    "emocional": 'Você disse que <span class="ul">o emocional sabota</span>: ansiedade, comparação, sensação de atraso.',
    "todas": 'Você disse que sente <span class="ul">um pouco de tudo</span> isso ao mesmo tempo.',
}
# Card "maior gargalo" da tela 1 — 3ª pessoa (o rótulo cru é em 1ª pessoa).
_DOR_TELA1 = {
    "base": "Não tem base: sente que começa do zero a cada edital",
    "improviso": "Estuda no improviso, sem cronograma nem ordem",
    "tempo": "Pouco tempo: concilia estudo com trabalho",
    "discursiva": "Trava na discursiva, na peça ou na sentença",
    "fixar": "Lê muito e resolve pouco: não fixa",
    "juris": "Não dá conta de acompanhar jurisprudência e informativos",
    "emocional": "O emocional sabota: ansiedade, comparação, sensação de atraso",
    "todas": "Um pouco de tudo isso ao mesmo tempo",
}
_ICO_RAIO = (
    '<span class="gn-ico" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" '
    'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">'
    '<path d="M13 2L4.5 13.5H11l-1 8.5L19.5 10H13l0-8Z"/></svg></span>'
)
# Frase de efeito final da tela 3. Só existe onde dá pra apoiar num item real
# do produto (atualizações jurídicas mensais, na página oficial). Sem entrada
# aqui, o elemento some (ver render._SET_VARS_JS).
_DOR_NOTA = {
    "juris": (
        _ICO_RAIO
        + '<span><b>É assim que a jurisprudência deixa de afogar:</b> você estuda o informativo junto '
        "com o tema dele, e as atualizações jurídicas mensais trazem o que mudou.</span>"
    ),
}


def _paragrafos_dor():
    grupo = next(g for g in BLOCKS if g["group"] == "O maior gargalo declarado")
    return {item["when"]["eq"]["dor"][0]: item["paragraphs"] for item in grupo["items"]}


_DOR_PARAGRAFOS = _paragrafos_dor()

# ---- transforms 1ª -> 3ª pessoa (tela 1) --------------------------------
_TEMPO_TELA1 = {
    "t0": "ainda não começou", "t1": "menos de 6 meses",
    "t2": "6 meses a 1 ano", "t3": "1 a 2 anos",
    "t4": "2 a 4 anos", "t5": "mais de 4 anos",
}
_PROVAS_TELA1 = {
    "p0": "Nunca fez uma prova de carreira jurídica",
    "p1": "Fez uma ou duas e ficou longe do corte",
    "p2": "Fez várias e continua longe do corte",
    "p3": "Fica perto do corte ou cai na discursiva",
    "p4": "Já foi aprovado(a) em concurso jurídico e quer subir de carreira",
}
_EDITAL_TELA1 = {
    "reta": "Já saiu, prova em menos de 3 meses",
    "previsto": "Previsto pros próximos meses",
    "sem": "Sem edital específico, quer estar pronto(a) quando abrir",
    "nao": "Não acompanha as previsões",
}
_EDITAL_CAPA = {
    "reta": "edital já saiu, prova em menos de 3 meses",
    "previsto": "edital previsto pros próximos meses",
    "sem": "sem edital específico no momento",
    "nao": "não acompanha previsões de edital",
}
# Forma curta de "horas" usada na frase da tela 4 (prazo_titulo).
_HORAS_CURTO = {
    "h0": "menos de 1 hora", "h1": "1 a 2 horas", "h2": "2 a 3 horas",
    "h3": "3 a 4 horas", "h4": "mais de 4 horas",
}
# Rótulo da faixa no painel da tela 4.
_HORAS_PAINEL = [("h0", "Menos de 1h"), ("h1", "1 a 2h"), ("h2", "2 a 3h"), ("h3", "3 a 4h"), ("h4", "Mais de 4h")]

_ALVO_FULL = {
    "juiz": "Magistratura",
    "mp": "Ministério Público",
    "defensoria": "Defensoria Pública",
    "procuradoria": "Advocacia Pública",
    "delegado": "Delegado de Polícia",
    "any": "Qualquer carreira jurídica",
}

# ---- oferta (telas 18 a 20) ---------------------------------------------
# Preços da página oficial (Black Friday, conferidos em 11/11/2026): de
# R$ 4.272,00 por 12x de R$ 233,09, ou R$ 2.666,58 à vista com o cupom
# BLACKVDE. Trocar aqui (e nas telas 18/19 do deck.html) quando a oferta mudar.
PRECO_TABELA = 4272.00
PRECO_A_VISTA = 2666.58
PARCELA_12X = 233.09
CUPOM = "BLACKVDE"


def _reais(valor: float) -> str:
    return f"R$ {valor:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def _primeira_maiuscula(texto: str) -> str:
    return texto[:1].upper() + texto[1:]


def _destaques(alvo: str, cargo: str) -> tuple:
    if alvo == "delegado":
        return _DESTAQUE_DELEGADO
    if cargo == "trabalho":
        return _DESTAQUE_TRABALHO
    return _DESTAQUE_PADRAO


def _html_lista_disciplinas(destaque: tuple) -> str:
    return "".join(
        f'<li class="hl">{_esc(d)}</li>' if d in destaque else f"<li>{_esc(d)}</li>"
        for d in GRADE["disciplinas"]
    )


def _curso_titulo_html(alvo: str) -> str:
    if alvo == "any" or alvo not in _ALVO_FULL:
        return 'Qualquer carreira jurídica começa pela <span class="ul">mesma base</span>.'
    return (
        f'Você quer <span class="ul">{_esc(_ALVO_FULL[alvo])}</span>, '
        "e a base é a mesma de toda carreira jurídica."
    )


def _curso_grade_html(alvo: str, cargo: str) -> str:
    return (
        '<div class="comp-head" style="padding:26px 44px 20px;">'
        '<span class="ct" style="font-size:40px;">Formação de <span class="u">Base</span></span>'
        f'<span class="cc" style="font-size:26px;">{GRADE["disciplinas_total"]} disciplinas · '
        f'{GRADE["temas"]} temas · entre elas:</span>'
        "</div>"
        '<ul class="comp-list" style="display:grid;grid-template-columns:repeat(3,1fr);'
        f'column-gap:44px;row-gap:2px;padding:26px 40px 30px;">{_html_lista_disciplinas(_destaques(alvo, cargo))}</ul>'
    )


def _dor_texto_html(dor: str) -> str:
    paragrafos = _DOR_PARAGRAFOS[dor]
    return "".join(f'<div class="icard" style="font-size:34px;">{_esc(p)}</div>' for p in paragrafos)


def _alvo_full(alvo: str) -> str:
    return _ALVO_FULL.get(alvo, ALVOS.get(alvo, ""))


def _curso_painel_html(horas: str) -> str:
    # PENDENTE: confirmar prazos (meses de base por horas/dia) do cronograma de
    # Carreiras Jurídicas. O deck de Tribunais mostrava 2h=12, 3h=8, 4h=6 meses;
    # pra Carreiras não há número oficial, então o painel mostra só o ritmo
    # (RITMOS de diagnosis/profile.py, o mesmo texto do quiz), sem meses.
    corpo = []
    for codigo, rotulo in _HORAS_PAINEL:
        classe = "trow rt"
        extra = ""
        if codigo == horas:
            classe += " you"
            extra = '<span class="you-badge">o seu hoje</span>'
        corpo.append(
            f'<div class="{classe}"><span class="hrs"><b>{_esc(rotulo)}</b> por dia{extra}</span>'
            f'<span class="desc">{_esc(_primeira_maiuscula(RITMOS.get(codigo, "")))}.</span></div>'
        )
    return (
        '<div class="course-head" style="padding:18px 40px;">'
        '<span class="ch-ico"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" '
        'stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/>'
        '<path d="M12 7v5l3.5 2"/></svg></span>'
        '<span class="cn" style="font-size:34px;">O seu ritmo</span></div>'
        f'<div class="course-body" style="padding:4px 30px 10px;">{"".join(corpo)}</div>'
    )


def variaveis(dados: dict) -> dict[str, str]:
    """Todo `data-var` do deck.html, calculado a partir dos campos brutos do
    quiz (o mesmo formato que LaudoRequest já valida em main.py)."""
    lead = Lead(dados)
    perfil = profile(lead)
    primeiro_nome = lead.nome.split(" ")[0] if lead.nome else ""
    alvo = lead.get("alvo")
    cargo = lead.get("cargo")
    horas = lead.get("horas")
    dor = lead.get("dor")
    edital = lead.get("edital")

    # Ritmo pelo tempo declarado (RITMOS, mesmo texto do quiz). Sem meses:
    # os prazos de base de Carreiras ainda não foram confirmados.
    ritmo = _primeira_maiuscula(perfil["ritmo"])

    dinheiro = int(lead.get("dinheiro"))  # anual, em milhares — ver TELA_DINHEIRO
    mensal = dinheiro // 12

    return {
        # capa
        "nome": _esc(primeiro_nome),
        "cargo": _esc(lead.label("cargo")),
        "alvo": _esc(ALVOS.get(alvo, "")),
        "edital": _esc(_EDITAL_CAPA.get(edital, lead.label("edital"))),
        # tela 1
        "alvo_full": _esc(_alvo_full(alvo)),
        "formacao": _esc(lead.label("formacao")),
        "tempo": _esc(_TEMPO_TELA1.get(lead.get("tempo"), lead.label("tempo"))),
        "provas": _esc(_PROVAS_TELA1.get(lead.get("provas"), lead.label("provas"))),
        "horas": _esc(lead.label("horas")),
        "edital_curto": _esc(_EDITAL_TELA1.get(edital, lead.label("edital"))),
        "dor": _esc(_DOR_TELA1.get(dor, lead.label("dor"))),
        # tela 2
        "diagnostico": 'O que está entre você e a posse é a <span class="em-gold">formação de base</span>.',
        "momento": _esc(MOMENTOS.get(lead.get("momento"), "")),
        "nivel": _esc(f'{perfil["acertos"]} de {len(TEST)} acertos, nível {perfil["nivel"]}'),
        "curso": "Formação de Base",
        "prazo": _esc(ritmo),
        # tela 3
        "dor_titulo": _DOR_TITULO.get(dor, _esc(f'Você disse que "{lead.label("dor")}".')),
        "dor_texto": _dor_texto_html(dor),
        "dor_nota": _DOR_NOTA.get(dor, ""),
        # tela 4
        "prazo_titulo": (
            f'Com <span class="ul">{_esc(_HORAS_CURTO.get(horas, lead.label("horas").lower()))}</span> por dia, '
            "o cronograma se ajusta ao seu tempo."
        ),
        "curso_painel": _curso_painel_html(horas),
        # tela 6
        "curso_titulo": _curso_titulo_html(alvo),
        "curso_grade": _curso_grade_html(alvo, cargo),
        # tela 19 — oferta da Black Friday (página oficial)
        "condicao_k": f"Black Friday · cupom {CUPOM}",
        "condicao_old": _reais(PRECO_TABELA),
        "condicao_new": _reais(PRECO_A_VISTA),
        "condicao_sub": f"à vista, ou 12x de {_reais(PARCELA_12X)}",
        # tela 20
        "roi_titulo": f'Você me disse que passaria a ganhar <span class="em-gold">R$ {mensal} mil a mais por mês</span>.',
        "roi_investimento": _reais(PRECO_A_VISTA),
        "roi_retorno": f"R$ {dinheiro} mil",
    }
