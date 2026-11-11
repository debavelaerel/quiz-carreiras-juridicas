"""O diagnóstico principal, escolhido pela última pergunta do quiz.

GERADO por scripts/gerar-dados-pdf.mts a partir de lib/quizContent.ts e lib/data/blocos.json.
Não editar à mão: mude o conteúdo no quiz e rode o gerador de novo.
"""

DIAGNOSES = {
    "zero": {
        "titulo": "Você está no melhor momento pra fazer a coisa certa desde o início.",
        "texto": [
            "Quem começa carreira jurídica sem ordem passa um ano lendo manual de mil páginas e, no primeiro edital, descobre que não sabe resolver questão de banca. Eu vejo isso todo dia.",
            "O que decide o seu caso é sequência. As disciplinas que se repetem em toda carreira, Constitucional, Administrativo, Penal, Processo Penal, Civil e Processo Civil, vêm antes de qualquer matéria específica do cargo."
        ],
        "prescricao": "escolher um ritmo de cronograma que caiba no seu dia real, começar pelas disciplinas comuns a toda carreira e resolver questões de FGV, Cebraspe e FCC desde a primeira semana, mesmo errando.",
        "ordem": [
            "Disciplinas comuns: Constitucional, Administrativo, Penal, Processo Penal, Civil e Processo Civil.",
            "Questões da banca desde a primeira semana, com caderno de erros.",
            "Lei seca e informativos junto com a teoria, não depois.",
            "Só depois as específicas da sua carreira."
        ]
    },
    "sembase": {
        "titulo": "Você já pagou o preço de estudar sem estrutura.",
        "texto": [
            "Horas investidas e a sensação de que nada fixa. São mais de 20 disciplinas, e sem uma ordem clara cada uma puxa você pra um lado. A cada edital você recomeça, porque nenhum alicerce sobreviveu do concurso anterior.",
            "Mais um manual só adia. O que resolve é fechar um único caminho e medir o seu avanço por questão resolvida em cada disciplina, com número na mão."
        ],
        "prescricao": "parar de acumular fontes, fechar um único cronograma de formação de base e medir o progresso por questões acertadas por disciplina, semana a semana.",
        "ordem": [
            "Escolher uma fonte por disciplina e abandonar as outras.",
            "Fechar as disciplinas comuns em sequência, sem pular.",
            "Questões comentadas de FGV, Cebraspe e FCC como termômetro semanal.",
            "Específicas da sua carreira só com a base fechada."
        ]
    },
    "plato": {
        "titulo": "O seu ponto vaza sempre no mesmo lugar.",
        "texto": [
            "Quem para perto do corte, ou passa da objetiva e cai na discursiva, não sabe menos que o aprovado. Erra em lugares específicos e repete os mesmos lugares em toda prova. Enquanto esses lugares não têm nome, a nota fica parada.",
            "Mais horas costumam ir justamente pro que você já domina. Abrir as suas provas, separar o que vazou na objetiva do que vazou na escrita e tratar cada vazamento onde ele acontece é o que destrava."
        ],
        "prescricao": "abrir o espelho da sua última prova e separar o que você errou por não saber o conteúdo do que errou na leitura do enunciado ou na escrita. São problemas diferentes, e tratar todos do mesmo jeito é o que sustenta o platô.",
        "ordem": [
            "Separar erro de conteúdo, erro de leitura e erro de escrita.",
            "Erro de conteúdo: teoria curta e questão da mesma banca, no assunto exato.",
            "Erro de escrita: uma discursiva por semana, que você mesmo corrige pelo espelho da banca.",
            "Matéria forte entra só em revisão, nunca em reestudo."
        ]
    },
    "improviso": {
        "titulo": "Você estuda no modo edital.",
        "texto": [
            "Sai o concurso, corre, faz a prova, para. Na carreira jurídica, entre o edital e a prova há poucos meses, e ninguém forma em poucos meses a base que a banca cobra. Enquanto o ciclo não quebrar, cada edital vai te encontrar no mesmo lugar.",
            "A boa notícia: carreira jurídica abre o ano inteiro. São 27 Tribunais de Justiça, 27 Ministérios Públicos, 27 Defensorias, 27 Procuradorias e 27 Polícias Civis, mais a esfera federal, e a base de disciplinas é a mesma. Quem constrói essa base uma vez aproveita em todos."
        ],
        "prescricao": "estudar agora, sem edital publicado, a base comum que cai em toda carreira jurídica, pra que o próximo edital te encontre revisando, e não começando.",
        "ordem": [
            "Cronograma de base independente de edital, com data de fim.",
            "Base comum primeiro: Constitucional, Administrativo, Penal e Civil.",
            "Questões da banca como rotina, não como véspera.",
            "Quando o edital sair, só ajustar as específicas e revisar."
        ]
    },
    "servidor": {
        "titulo": "Você já tem o Direito na prática. Falta transformar em prova.",
        "texto": [
            "Quem advoga, assessora ou já é servidor conhece o Direito que usa todo dia, e é justamente aí que mora a armadilha: a prova cobra o que você não usa, na profundidade da banca, com doutrina e jurisprudência dos tribunais superiores.",
            "Recomeçar do zero seria desperdício. O seu caso pede um cronograma que trate o que você já domina como revisão e concentre as horas onde a base ainda tem buraco."
        ],
        "prescricao": "mapear por questões o que você já domina, manter isso em revisão leve e montar o cronograma em cima das disciplinas que você não pratica no trabalho.",
        "ordem": [
            "Diagnóstico por questões em cada disciplina comum.",
            "O que você usa no trabalho entra só em revisão.",
            "Horas concentradas nas disciplinas que você não pratica.",
            "Atividade jurídica documentada desde já, pra inscrição definitiva."
        ]
    }
}
