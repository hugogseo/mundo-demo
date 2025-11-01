import { parseIntent } from '@/lib/agentic/intent-parser'

describe('intent-parser', () => {
  it('extracts entities and operations for invoices', () => {
    const intent = parseIntent('Freelancers create invoices for clients')
    const names = intent.entities.map((e) => e.name)
    expect(names).toEqual(expect.arrayContaining(['Invoice', 'Client']))
    expect(intent.operations.length).toBeGreaterThan(0)
  })

  it('adds payment questions when payments are mentioned', () => {
    const intent = parseIntent('Clients make payments for invoices')
    expect(intent.questions.join(' ').toLowerCase()).toContain('guest')
    expect(intent.questions.join(' ').toLowerCase()).toContain('recurring')
  })
})
