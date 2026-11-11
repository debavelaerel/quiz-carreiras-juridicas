import { describe, it, expect } from 'vitest'
import type { SupabaseClient } from '@supabase/supabase-js'
import { criarSupabaseSessionRepo } from './supabaseSessionRepo'

// O "Refazer" guarda token_conclusao dentro do jsonb perfil_calculado, pra não
// exigir coluna nova no banco (esquema idêntico ao do Tribunais).
function clienteFalso(linhaDevolvida: Record<string, unknown>) {
  const gravado: { patch?: Record<string, unknown> } = {}
  const client = {
    from: () => ({
      update: (patch: Record<string, unknown>) => {
        gravado.patch = patch
        return { eq: () => ({ select: () => ({ single: async () => ({ data: { ...linhaDevolvida, ...patch }, error: null }) }) }) }
      },
    }),
  } as unknown as SupabaseClient
  return { client, gravado }
}

const PERFIL_CALC = { classe: 'A', curso: 'Base', cursoCod: 'CJ-BASE', ritmo: 'x' }

describe('token_conclusao dentro de perfil_calculado', () => {
  it('grava o token junto da classificação e devolve os dois separados', async () => {
    const { client, gravado } = clienteFalso({ id: 1, perfil_calculado: null })
    const sessao = await criarSupabaseSessionRepo(client).atualizar(1, { perfilCalculado: PERFIL_CALC as never, tokenConclusao: 'tok-1' })
    expect(gravado.patch).toEqual({ perfil_calculado: { ...PERFIL_CALC, token_conclusao: 'tok-1' } })
    expect(Object.keys(gravado.patch!)).not.toContain('token_conclusao')
    expect(sessao.tokenConclusao).toBe('tok-1')
    expect(sessao.perfilCalculado).toEqual(PERFIL_CALC)
  })

  it('reset do Refazer zera o jsonb inteiro', async () => {
    const { client, gravado } = clienteFalso({ id: 1 })
    const sessao = await criarSupabaseSessionRepo(client).atualizar(1, { perfilCalculado: null, tokenConclusao: null })
    expect(gravado.patch).toEqual({ perfil_calculado: null })
    expect(sessao.tokenConclusao).toBeNull()
  })

  it('criação da sessão (classificação null, sem token) grava null', async () => {
    const { client, gravado } = clienteFalso({ id: 1 })
    await criarSupabaseSessionRepo(client).atualizar(1, { perfilCalculado: null })
    expect(gravado.patch).toEqual({ perfil_calculado: null })
  })

  it('recusa gravar o token sem a classificação (apagaria a classificação) (um sobrescreveria o outro)', async () => {
    const { client } = clienteFalso({ id: 1 })
    await expect(criarSupabaseSessionRepo(client).atualizar(1, { tokenConclusao: 'tok' })).rejects.toThrow()
  })
})
