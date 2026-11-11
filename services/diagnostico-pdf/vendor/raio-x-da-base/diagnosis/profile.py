"""Classificação do lead: pontuação, curso indicado, ritmo e nível.

Antes isso rodava no navegador. Agora roda só aqui, então o time tem uma
resposta só, calculada no mesmo lugar que escreve o laudo.
"""
from .questions import TEST

# Mesmo texto de lib/perfil.ts (RITMOS). PENDENTE: prazos reais do cronograma de Carreiras.
RITMOS = {
    "h0": "abaixo do cronograma mínimo; o ideal é chegar a 2h por dia",
    "h1": "cronograma padrão, desenhado pra quem trabalha",
    "h2": "acima do padrão: a base fecha antes",
    "h3": "ritmo forte: a base fecha bem antes do padrão",
    "h4": "ritmo intensivo: o cronograma mais curto",
}
NIVEIS = {0: "inicial", 1: "inicial", 2: "intermediário", 3: "intermediário", 4: "avançado", 5: "avançado"}

ALVOS = {"juiz": "Magistratura", "mp": "Ministério Público", "defensoria": "Defensoria Pública",
         "procuradoria": "Advocacia Pública", "delegado": "Polícia", "any": "qualquer carreira jurídica"}
MOMENTOS = {"zero": "Começo do zero", "sembase": "Estudo sem base",
            "plato": "Veterano travado no corte", "improviso": "Ciclo do improviso",
            "servidor": "Do Direito na prática pra carreira"}


def points(lead):
    pts = 0
    cargo, alvo = lead.get("cargo"), lead.get("alvo")
    if cargo in ("estadual", "federal", "trabalho", "municipal"):
        pts += 2
    elif cargo in ("any", "unsure"):
        pts += 1
    pts += 2 if lead.get("formacao") == "direito" else 1
    horas = lead.get("horas")
    if horas == "h1":
        pts += 1
    elif horas in ("h2", "h3", "h4"):
        pts += 2
    edital = lead.get("edital")
    if edital in ("previsto", "sem"):
        pts += 2
    elif edital == "nao":
        pts += 1
    if lead.get("dor") in ("base", "improviso", "juris", "todas"):
        pts += 1
    return pts


def profile(lead):
    """Tudo o que o consultor precisa ver em uma linha, e o laudo no cabeçalho."""
    pts = points(lead)
    return {
        "pontos": pts,
        "classe": "A" if pts >= 7 else "B",
        "curso_cod": "CJ-BASE",
        "curso": "Formação de Base · Carreiras Jurídicas (23 disciplinas, 420+ temas)",
        "ritmo": RITMOS.get(lead.get("horas"), ""),
        "acertos": lead.score,
        "nivel": NIVEIS[lead.score],
        "momento": MOMENTOS[lead.get("momento")],
        "alvo": ALVOS.get(lead.get("alvo"), ""),
        "cargo": lead.label("cargo").lower(),
    }


def one_line(lead):
    """Resumo de uma linha, pro consultor colar no CRM."""
    p = profile(lead)
    return (f"perfil {p['classe']} ({p['pontos']} pts) · {p['curso_cod']} · "
            f"{p['momento'].lower()} · {lead.get('dor')} · {lead.label('horas').lower()} · "
            f"edital:{lead.get('edital')} · teste {p['acertos']}/{len(TEST)} · "
            f"vde:{lead.get('vde')}")
