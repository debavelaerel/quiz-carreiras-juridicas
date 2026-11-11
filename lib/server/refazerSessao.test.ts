// Refazer o quiz com o mesmo contato substitui o resultado anterior — mas só
// quando o pedido traz o session_token da sessão antiga (prova de que vem do
// navegador de quem fez o diagnóstico). Sem ele, a regra de segurança de
// quizService continua: saber o contato de alguém não apaga o resultado dela.
import { describe, it, expect } from 'vitest'
import { criarFakeSessionRepo } from './testHelpers/fakeSessionRepo'
import { iniciarSessao, registrarResposta, registrarPerfil, concluirSessao } from './quizService'
import { QUESTIONS } from '../questions'

const EVENTO = 'diagnostico-carreiras-juridicas'
const CONTATO = { nome: 'Maria Silva', whatsapp: '11987654321', email: 'maria@x.com', evento: EVENTO }

async function concluida() {
  const repo = criarFakeSessionRepo()
  await iniciarSessao(repo, { ...CONTATO, sessionToken: 'tok-1' })
  await registrarPerfil(repo, 'tok-1', { alvo: 'juiz' })
  for (const q of QUESTIONS) await registrarResposta(repo, 'tok-1', { num: q.num, escolhida: 'A' })
  await concluirSessao(repo, 'tok-1')
  await repo.atualizar(repo.linhas[0].id, { laudoPdfS3Key: 'laudos/antigo.pdf', apresentacaoPdfS3Key: 'apres/antiga.pdf' })
  return repo
}

describe('iniciarSessao com refazerToken', () => {
  it('zera a sessão concluída quando o token antigo bate', async () => {
    const repo = await concluida()
    const r = await iniciarSessao(repo, { ...CONTATO, sessionToken: 'tok-2', refazerToken: 'tok-1' })
    expect(r).toMatchObject({ sessionToken: 'tok-2', retomando: false, jaConcluida: false, respostasSalvas: [] })
    expect(repo.linhas).toHaveLength(1)
    const s = repo.linhas[0]
    expect(s.status).toBe('em_andamento')
    expect(s.respostas).toEqual([])
    expect(s.perfil).toEqual({})
    expect(s.perfilCalculado).toBeNull()
    expect(s.blocos).toBeNull()
    expect(s.acertos).toBeNull()
    expect(s.completedAt).toBeNull()
    expect(s.laudoPdfS3Key).toBeNull()
    expect(s.apresentacaoPdfS3Key).toBeNull()
  })

  it('o resultado novo substitui o antigo depois de concluir de novo', async () => {
    const repo = await concluida()
    await iniciarSessao(repo, { ...CONTATO, sessionToken: 'tok-2', refazerToken: 'tok-1' })
    await registrarPerfil(repo, 'tok-2', { alvo: 'delegado' })
    for (const q of QUESTIONS) await registrarResposta(repo, 'tok-2', { num: q.num, escolhida: 'E' })
    const nova = await concluirSessao(repo, 'tok-2')
    expect(nova.status).toBe('concluido')
    expect(nova.perfil).toEqual({ alvo: 'delegado' })
    expect(nova.respostas.every((r) => r.escolhida === 'E')).toBe(true)
  })

  it('NÃO zera quando o token não bate — mostra o resultado antigo', async () => {
    const repo = await concluida()
    const r = await iniciarSessao(repo, { ...CONTATO, sessionToken: 'tok-2', refazerToken: 'tok-de-outra-pessoa' })
    expect(r.jaConcluida).toBe(true)
    expect(repo.linhas[0].status).toBe('concluido')
    expect(repo.linhas[0].laudoPdfS3Key).toBe('laudos/antigo.pdf')
  })

  it('NÃO zera sem refazerToken (comportamento antigo intacto)', async () => {
    const repo = await concluida()
    const r = await iniciarSessao(repo, { ...CONTATO, sessionToken: 'tok-2' })
    expect(r.jaConcluida).toBe(true)
    expect(repo.linhas[0].status).toBe('concluido')
  })
})

describe('refazer: ataque em dois passos', () => {
  it('quem só sabe o contato não consegue zerar o resultado, mesmo rotacionando o token antes', async () => {
    const repo = await concluida()
    // Passo 1: atacante "retoma" pelo contato, o que troca o sessionToken para o dele.
    const r1 = await iniciarSessao(repo, { ...CONTATO, sessionToken: 'tok-atacante' })
    expect(r1.sessionToken).toBe('tok-atacante')
    // Passo 2: usa o token que ele mesmo escolheu como prova de refazer.
    const r2 = await iniciarSessao(repo, { ...CONTATO, sessionToken: 'tok-atacante-2', refazerToken: 'tok-atacante' })
    expect(r2.jaConcluida).toBe(true)
    expect(repo.linhas[0].status).toBe('concluido')
    expect(repo.linhas[0].respostas).toHaveLength(QUESTIONS.length)
  })

  it('o dono continua conseguindo refazer depois que alguém rotacionou o token', async () => {
    const repo = await concluida()
    await iniciarSessao(repo, { ...CONTATO, sessionToken: 'tok-atacante' })
    const r = await iniciarSessao(repo, { ...CONTATO, sessionToken: 'tok-2', refazerToken: 'tok-1' })
    expect(r.jaConcluida).toBe(false)
    expect(repo.linhas[0].status).toBe('em_andamento')
  })
})
