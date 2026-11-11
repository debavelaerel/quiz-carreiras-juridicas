"""Perguntas, opções e editais do quiz.

GERADO por scripts/gerar-dados-pdf.mts a partir de lib/quizContent.ts e lib/data/blocos.json.
Não editar à mão: mude o conteúdo no quiz e rode o gerador de novo.
"""

QUESTIONS = {
    "alvo": {
        "tipo": "single",
        "titulo": "Qual carreira é a sua prioridade hoje?",
        "opcoes": [
            [
                "juiz",
                "Magistratura",
                "juiz de direito, juiz federal ou juiz do trabalho"
            ],
            [
                "mp",
                "Ministério Público",
                "promotor de justiça ou procurador da República"
            ],
            [
                "defensoria",
                "Defensoria Pública",
                "defensor público estadual ou federal"
            ],
            [
                "procuradoria",
                "Advocacia Pública",
                "procurador do estado, AGU ou procurador do município"
            ],
            [
                "delegado",
                "Delegado de Polícia",
                "Polícia Civil ou Polícia Federal"
            ],
            [
                "any",
                "Qualquer carreira jurídica, a que abrir primeiro"
            ],
            [
                "outro",
                "Outro concurso, fora das carreiras jurídicas",
                "servidor de tribunal, OAB ou outra área"
            ]
        ]
    },
    "cargo": {
        "tipo": "single",
        "titulo": "E em qual esfera?",
        "opcoes": [
            [
                "estadual",
                "estadual"
            ],
            [
                "federal",
                "federal"
            ],
            [
                "trabalho",
                "trabalho"
            ],
            [
                "any",
                "any"
            ],
            [
                "unsure",
                "unsure"
            ],
            [
                "municipal",
                "municipal"
            ]
        ]
    },
    "formacao": {
        "tipo": "single",
        "titulo": "Qual é a sua formação hoje?",
        "opcoes": [
            [
                "direito",
                "Bacharel em Direito"
            ],
            [
                "cursando_direito",
                "Cursando Direito"
            ],
            [
                "outra",
                "Superior completo em outra área"
            ],
            [
                "cursando_outra",
                "Cursando outra área"
            ],
            [
                "medio",
                "Ensino médio completo"
            ]
        ]
    },
    "tempo": {
        "tipo": "single",
        "titulo": "Há quanto tempo você estuda pra concursos?",
        "opcoes": [
            [
                "t0",
                "Ainda não comecei"
            ],
            [
                "t1",
                "Menos de 6 meses"
            ],
            [
                "t2",
                "Entre 6 meses e 1 ano"
            ],
            [
                "t3",
                "Entre 1 e 2 anos"
            ],
            [
                "t4",
                "Entre 2 e 4 anos"
            ],
            [
                "t5",
                "Mais de 4 anos"
            ]
        ]
    },
    "provas": {
        "tipo": "single",
        "titulo": "Quantas provas de carreira jurídica você já fez, e como foi?",
        "opcoes": [
            [
                "p0",
                "Nunca fiz uma prova de carreira jurídica"
            ],
            [
                "p1",
                "Fiz uma ou duas e fiquei longe do corte"
            ],
            [
                "p2",
                "Fiz várias e continuo longe do corte"
            ],
            [
                "p3",
                "Fico perto do corte, ou passo da objetiva e caio na discursiva"
            ],
            [
                "p4",
                "Já fui aprovado(a) em concurso jurídico e quero subir de carreira"
            ]
        ]
    },
    "metodo": {
        "tipo": "single",
        "titulo": "Como você estudou até aqui?",
        "opcoes": [
            [
                "nenhum",
                "Nunca estudei com método, vou no improviso"
            ],
            [
                "video",
                "Videoaulas de cursinho grande, muitas horas de vídeo"
            ],
            [
                "pdf",
                "PDF e questões, com cronograma"
            ],
            [
                "questoes",
                "Só questões"
            ],
            [
                "retafinal",
                "Só quando sai edital, com curso de reta final"
            ],
            [
                "mentoria",
                "Mentoria ou coaching"
            ]
        ]
    },
    "vde": {
        "tipo": "single",
        "titulo": "Você já conhece o Método VDE?",
        "opcoes": [
            [
                "nunca",
                "Nunca ouvi falar"
            ],
            [
                "insta",
                "Sigo no Instagram, mas nunca estudei com vocês"
            ],
            [
                "exaluno",
                "Já fui aluno(a) da OAB ou de outro curso do VDE"
            ],
            [
                "aluno",
                "Já sou aluno(a) do VDE Concursos"
            ]
        ]
    },
    "horas": {
        "tipo": "single",
        "titulo": "Quantas horas por dia você consegue estudar, sendo realista?",
        "opcoes": [
            [
                "h0",
                "Menos de 1 hora"
            ],
            [
                "h1",
                "Entre 1 e 2 horas"
            ],
            [
                "h2",
                "Entre 2 e 3 horas"
            ],
            [
                "h3",
                "Entre 3 e 4 horas"
            ],
            [
                "h4",
                "Mais de 4 horas"
            ]
        ]
    },
    "edital": {
        "tipo": "single",
        "titulo": "Você tem edital na mira?",
        "opcoes": [
            [
                "reta",
                "Já saiu, e a prova é em menos de 3 meses"
            ],
            [
                "previsto",
                "Tem edital previsto pros próximos meses"
            ],
            [
                "sem",
                "Não tenho um edital específico: quero estar pronto quando abrir"
            ],
            [
                "nao",
                "Não acompanho as previsões"
            ]
        ]
    },
    "dor": {
        "tipo": "single",
        "titulo": "Qual é o seu maior gargalo hoje?",
        "opcoes": [
            [
                "base",
                "Não tenho base: sinto que começo do zero a cada edital"
            ],
            [
                "improviso",
                "Estudo no improviso, sem cronograma nem ordem"
            ],
            [
                "tempo",
                "Pouco tempo: concilio estudo com trabalho"
            ],
            [
                "discursiva",
                "Travo na discursiva, na peça ou na sentença"
            ],
            [
                "fixar",
                "Leio muito e resolvo pouco: não fixo"
            ],
            [
                "juris",
                "Não dou conta de acompanhar jurisprudência e informativos"
            ],
            [
                "emocional",
                "O emocional sabota: ansiedade, comparação, sensação de atraso"
            ],
            [
                "todas",
                "Todas acima"
            ]
        ]
    },
    "momento": {
        "tipo": "single",
        "titulo": "Última: qual dessas frases você diria pra um amigo hoje?",
        "opcoes": [
            [
                "zero",
                "Estou começando do zero, ainda me organizando"
            ],
            [
                "sembase",
                "Estudo há um tempo, mas sem base sólida: fico perdido no meio das disciplinas"
            ],
            [
                "plato",
                "Chego perto do corte e não passo, prova atrás de prova"
            ],
            [
                "improviso",
                "Só estudo quando sai edital, e recomeço do zero toda vez"
            ],
            [
                "servidor",
                "Já trabalho com Direito e quero migrar pra uma carreira jurídica"
            ]
        ]
    },
    "dinheiro": {
        "tipo": "single",
        "titulo": "Quanto você receberia a mais por mês se fosse aprovado(a) hoje na carreira que você mira?",
        "opcoes": [
            [
                "120",
                "Uns R$ 10 mil a mais por mês",
                "R$ 120 mil por ano"
            ],
            [
                "180",
                "Uns R$ 15 mil a mais por mês",
                "R$ 180 mil por ano"
            ],
            [
                "240",
                "Uns R$ 20 mil a mais por mês",
                "R$ 240 mil por ano"
            ],
            [
                "300",
                "Uns R$ 25 mil a mais por mês",
                "R$ 300 mil por ano"
            ],
            [
                "360",
                "R$ 30 mil ou mais a mais por mês",
                "R$ 360 mil por ano"
            ]
        ]
    },
    "leitura": {
        "tipo": "single",
        "titulo": "Quer que eu inclua no seu resultado o que priorizar no seu momento?",
        "opcoes": [
            [
                "completa",
                "Inclui, por favor"
            ],
            [
                "basica",
                "Só o diagnóstico já basta"
            ]
        ]
    }
}

CARGO_POR_ALVO = {
    "juiz": {
        "estadual": "juiz de direito",
        "federal": "juiz federal",
        "trabalho": "juiz do trabalho",
        "any": "juiz",
        "unsure": "juiz"
    },
    "mp": {
        "estadual": "promotor de justiça",
        "federal": "procurador da República",
        "any": "membro do MP",
        "unsure": "membro do MP"
    },
    "defensoria": {
        "estadual": "defensor público estadual",
        "federal": "defensor público federal",
        "any": "defensor público",
        "unsure": "defensor público"
    },
    "procuradoria": {
        "estadual": "procurador do estado",
        "federal": "advogado público federal",
        "municipal": "procurador do município",
        "any": "procurador",
        "unsure": "procurador"
    },
    "delegado": {
        "estadual": "delegado de Polícia Civil",
        "federal": "delegado de Polícia Federal",
        "any": "delegado",
        "unsure": "delegado"
    },
    "any": {
        "estadual": "carreira estadual",
        "federal": "carreira federal",
        "any": "o cargo que vier",
        "unsure": "um cargo ainda a definir"
    }
}

EDITAIS = {
    "juiz": [
        {
            "id": "tjsc",
            "label": "TJ SC",
            "sub": "edital publicado para juiz substituto (banca FGV); 15 vagas, inscrições até 26/11",
            "aberto": True
        },
        {
            "id": "tjrs",
            "label": "TJ RS",
            "sub": "edital publicado para juiz substituto (banca FGV); 30 vagas, prova em 13/12",
            "aberto": True
        },
        {
            "id": "tjap",
            "label": "TJ AP",
            "sub": "edital publicado para juiz substituto (banca FGV); 15 vagas, inscrições até 13/11",
            "aberto": True
        },
        {
            "id": "tjdft",
            "label": "TJDFT",
            "sub": "banca definida para juiz substituto (Cebraspe); 20 vagas previstas"
        },
        {
            "id": "tjpb",
            "label": "TJ PB",
            "sub": "concurso para juiz substituto em preparação; 6 vagas previstas"
        },
        {
            "id": "tjac",
            "label": "TJ AC",
            "sub": "regulamento publicado para juiz substituto; banca a definir"
        },
        {
            "id": "trfs",
            "label": "TRFs (juiz federal)",
            "sub": "concursos previstos no orçamento de 2027 nos seis TRFs"
        }
    ],
    "mp": [
        {
            "id": "mpap",
            "label": "MP AP",
            "sub": "banca definida para promotor substituto (FCC); 5 vagas previstas"
        },
        {
            "id": "mppe",
            "label": "MP PE",
            "sub": "regulamento publicado para promotor substituto; 15 vagas"
        },
        {
            "id": "mpsp",
            "label": "MP SP",
            "sub": "novo concurso para promotor em estudo; contratação da banca iniciada"
        },
        {
            "id": "mprj",
            "label": "MP RJ",
            "sub": "novo regulamento em preparação para o XL concurso de promotor"
        }
    ],
    "defensoria": [
        {
            "id": "dpesp",
            "label": "DPE SP",
            "sub": "edital publicado para defensor público (banca FCC); 70 vagas, prova em 10/01/2027",
            "aberto": True
        },
        {
            "id": "dpern",
            "label": "DPE RN",
            "sub": "banca definida para defensor público (Cebraspe); 10 vagas previstas"
        },
        {
            "id": "dpego",
            "label": "DPE GO",
            "sub": "regulamento publicado para defensor público; edital previsto"
        },
        {
            "id": "dpu",
            "label": "DPU",
            "sub": "comissão formada para contratar a banca do concurso de defensor federal"
        }
    ],
    "procuradoria": [
        {
            "id": "pgeba",
            "label": "PGE BA",
            "sub": "banca contratada para procurador do estado (FCC); 20 vagas"
        },
        {
            "id": "agu",
            "label": "AGU",
            "sub": "concurso unificado autorizado; 170 vagas, banca em definição"
        },
        {
            "id": "pgers",
            "label": "PGE RS",
            "sub": "comissão formada para o 16º concurso de procurador do estado"
        }
    ],
    "delegado": [
        {
            "id": "pcpe",
            "label": "PC PE",
            "sub": "edital publicado para delegado (banca Cebraspe); 45 vagas, inscrições até 16/12",
            "aberto": True
        },
        {
            "id": "pcac",
            "label": "PC AC",
            "sub": "edital publicado para delegado (banca Idecan); 8 vagas, inscrições até 14/12",
            "aberto": True
        },
        {
            "id": "pcap",
            "label": "PC AP",
            "sub": "edital publicado para delegado (banca Cesgranrio); prova em 06/12",
            "aberto": True
        },
        {
            "id": "pcrj",
            "label": "PC RJ",
            "sub": "banca definida para delegado (Cesgranrio); 85 vagas"
        },
        {
            "id": "pcto",
            "label": "PC TO",
            "sub": "concurso autorizado para delegado; comissão definida, 60 vagas"
        }
    ]
}

TEST = [
    {
        "disc": "Direito Constitucional",
        "fonte": "FGV · TJ MT 2024 · Juiz Substituto",
        "gabarito": "B",
        "comentario": "Criar vínculo de trabalho com ajuda de custo, fora da lei federal do estágio, é legislar sobre direito do trabalho: competência privativa da União (art. 22, I). Falar em adolescente e educação não torna a competência concorrente."
    },
    {
        "disc": "Direito Administrativo",
        "fonte": "FGV · DPE RJ 2023 · Defensor Público",
        "gabarito": "E",
        "comentario": "O Estado limitando a atividade do particular em nome do interesse coletivo (a calçada livre) é poder de polícia. Hierárquico e disciplinar só valem pra quem tem vínculo com a Administração, e autotutela é a Administração revendo os próprios atos."
    },
    {
        "disc": "Direito Penal",
        "fonte": "FGV · PC MG 2025 · Delegado de Polícia Substituto",
        "gabarito": "A",
        "comentario": "Ajudar o autor a fugir da polícia é favorecimento pessoal (art. 348), e o irmão que presta o auxílio fica isento de pena (§2º). Favorecimento real seria guardar o proveito do crime, e tergiversação é crime de advogado."
    },
    {
        "disc": "Direito Processual Penal",
        "fonte": "Cebraspe · DPE AC 2024 · Defensor Público",
        "gabarito": "E",
        "comentario": "O art. 240, §1º, do CPP permite a busca pra achar o que é necessário \"à prova de infração ou à defesa do réu\". As pegadinhas: cartas \"abertas ou não\", CPI não determina busca domiciliar (reserva de jurisdição), busca pessoal durante a domiciliar dispensa mandado e, com consentimento do morador, a busca pode ser à noite."
    },
    {
        "disc": "Direito Civil",
        "fonte": "FGV · TJ SC 2024 · Juiz Substituto",
        "gabarito": "E",
        "comentario": "É o \"contrato consigo mesmo\": sem permissão da lei ou do representado, é anulável (art. 117 do CC). Não é nulo nem inexistente: o vício protege Leonardo, que pode confirmar o negócio se quiser."
    }
]

CONFIG = {
    "quizName": "Diagnóstico da Base",
    "whatsapp": "5500000000000",
    "editaisAtualizadosEm": "11 de novembro de 2026",
    "instagram": "https://www.instagram.com/vdeconcursos/"
}
