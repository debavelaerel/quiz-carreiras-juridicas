// Pergunta de prática jurídica: só aparece pra bacharel, muda os blocos do
// diagnóstico (regra de 3 anos de juiz/MP) e soma 1 ponto pra quem já tem 3+.
import { describe, it, expect } from 'vitest'
import { selecionarBlocos } from './blocos'
import { calcularPerfil, type RespostasPerfil } from './perfil'
import { PERFIL_SCREENS, telaVisivel, fraseRequisitoPratica, editaisDisponiveis } from './quizContent'

const base: RespostasPerfil = { cargo: 'estadual', tempo: 't3', provas: 'p1', metodo: 'pdf', vde: 'insta', horas: 'h2', edital: 'previsto', editais: ['qualquer'], dor: 'base', momento: 'sembase', dinheiro: '240', leitura: 'completa' }
const respostas = [1, 2, 3, 4, 5].map((num) => ({ num, area: '', escolhida: 'A', gabarito: 'A', acertou: true }))
const blocoPratica = (r: RespostasPerfil) => selecionarBlocos(r, respostas).find((b) => b.group === 'Prática jurídica')?.id
const telaPratica = PERFIL_SCREENS.find((t) => t.key === 'pratica')!

describe('pergunta de prática jurídica', () => {
  it('só aparece pra quem já é bacharel', () => {
    expect(telaVisivel(telaPratica, { formacao: 'direito' })).toBe(true)
    expect(telaVisivel(telaPratica, { formacao: 'cursando_direito' })).toBe(false)
  })

  it('vem logo depois da formação', () => {
    const i = PERFIL_SCREENS.findIndex((t) => t.key === 'formacao')
    expect(PERFIL_SCREENS[i + 1].key).toBe('pratica')
  })

  it('juiz/MP sem os 3 anos recebe o bloco do prazo; com 3+ recebe o de requisito cumprido', () => {
    expect(blocoPratica({ ...base, alvo: 'juiz', formacao: 'direito', pratica: 'pj1' })).toBe('pj_falta_jm')
    expect(blocoPratica({ ...base, alvo: 'mp', formacao: 'direito', pratica: 'pj2' })).toBe('pj_falta_jm')
    expect(blocoPratica({ ...base, alvo: 'juiz', formacao: 'direito', pratica: 'pj3' })).toBe('pj_ok_jm')
  })

  it('outras carreiras sem 3 anos recebem o aviso de conferir o edital; com 3+ nada', () => {
    expect(blocoPratica({ ...base, alvo: 'delegado', formacao: 'direito', pratica: 'pj0' })).toBe('pj_outras')
    expect(blocoPratica({ ...base, alvo: 'delegado', formacao: 'direito', pratica: 'pj3' })).toBeUndefined()
  })

  it('quem está cursando não recebe bloco de prática, mesmo com resposta antiga de prática', () => {
    expect(blocoPratica({ ...base, alvo: 'juiz', formacao: 'cursando_direito', pratica: 'pj3' })).toBeUndefined()
  })

  it('3 anos ou mais somam 1 ponto, só pra bacharel', () => {
    const r = { ...base, alvo: 'juiz', formacao: 'direito' }
    expect(calcularPerfil({ ...r, pratica: 'pj3' }, 0).pontos - calcularPerfil({ ...r, pratica: 'pj1' }, 0).pontos).toBe(1)
    expect(calcularPerfil({ ...base, alvo: 'juiz', formacao: 'cursando_direito', pratica: 'pj3' }, 0).pontos)
      .toBe(calcularPerfil({ ...base, alvo: 'juiz', formacao: 'cursando_direito' }, 0).pontos)
  })

  it('frase da ficha segue a regra dos 3 anos só pra juiz e MP', () => {
    expect(fraseRequisitoPratica({ alvo: 'juiz', formacao: 'direito', pratica: 'pj3' })).toMatch(/já cumpre/)
    expect(fraseRequisitoPratica({ alvo: 'mp', formacao: 'direito', pratica: 'pj0' })).toMatch(/ainda está cumprindo/)
    expect(fraseRequisitoPratica({ alvo: 'juiz', formacao: 'cursando_direito' })).toMatch(/depois da formatura/)
    expect(fraseRequisitoPratica({ alvo: 'delegado', formacao: 'direito', pratica: 'pj0' })).toBe('')
  })
})

describe('concursos por carreira e esfera', () => {
  const ids = (r: RespostasPerfil) => editaisDisponiveis(r).map((e) => e.id)
  it('juiz estadual só vê TJs; federal só TRFs', () => {
    expect(ids({ alvo: 'juiz', cargo: 'estadual' }).every((id) => id.startsWith('tj'))).toBe(true)
    expect(ids({ alvo: 'juiz', cargo: 'federal' })).toEqual(['trf5', 'trfs'])
  })
  it('esfera sem concurso mostra o item dela primeiro e depois o resto da carreira', () => {
    expect(ids({ alvo: 'juiz', cargo: 'trabalho' })[0]).toBe('trt')
    expect(ids({ alvo: 'delegado', cargo: 'federal' })[0]).toBe('pf')
    expect(ids({ alvo: 'delegado', cargo: 'federal' })).toContain('pcpe')
  })
  it('delegado estadual nunca vê PF; defensor federal só DPU', () => {
    expect(ids({ alvo: 'delegado', cargo: 'estadual' })).not.toContain('pf')
    expect(ids({ alvo: 'defensoria', cargo: 'federal' })).toEqual(['dpu'])
  })
})
