import { parseIntent } from '@/lib/agentic/intent-parser'

describe('intent-parser', () => {
  describe('Entity Extraction', () => {
    it('extracts invoice entities', () => {
      const intent = parseIntent('Freelancers create invoices for clients')
      const names = intent.entities.map((e) => e.name)
      expect(names).toEqual(expect.arrayContaining(['Invoice', 'Client']))
    })

    it('extracts e-commerce entities', () => {
      const intent = parseIntent('Users browse products and add them to cart')
      const names = intent.entities.map((e) => e.name)
      expect(names).toEqual(expect.arrayContaining(['Product', 'Cart', 'Customer']))
    })

    it('extracts CRM entities', () => {
      const intent = parseIntent('Sales team manages leads and closes deals')
      const names = intent.entities.map((e) => e.name)
      expect(names).toEqual(expect.arrayContaining(['Lead', 'Deal', 'User']))
    })

    it('extracts booking entities', () => {
      const intent = parseIntent('Users schedule appointments')
      const names = intent.entities.map((e) => e.name)
      expect(names).toEqual(expect.arrayContaining(['Appointment', 'User']))
    })

    it('defaults to Record when no keywords matched', () => {
      const intent = parseIntent('Something completely unrelated')
      const names = intent.entities.map((e) => e.name)
      expect(names).toEqual(['Record'])
    })
  })

  describe('Relationship Inference', () => {
    it('infers invoice-client relationship', () => {
      const intent = parseIntent('Clients receive invoices')
      expect(intent.relationships).toContainEqual({
        from: 'Invoice',
        to: 'Client',
        type: 'many-to-one',
      })
    })

    it('infers order-product many-to-many relationship', () => {
      const intent = parseIntent('Customers place orders with products')
      expect(intent.relationships).toContainEqual({
        from: 'Order',
        to: 'Product',
        type: 'many-to-many',
      })
    })

    it('infers task-project relationship', () => {
      const intent = parseIntent('Project has multiple tasks')
      expect(intent.relationships).toContainEqual({
        from: 'Task',
        to: 'Project',
        type: 'many-to-one',
      })
    })

    it('infers subscription-customer relationship', () => {
      const intent = parseIntent('Customers subscribe to plans')
      expect(intent.relationships).toContainEqual({
        from: 'Subscription',
        to: 'Customer',
        type: 'many-to-one',
      })
    })
  })

  describe('Operations Extraction', () => {
    it('extracts operations from description', () => {
      const intent = parseIntent('Users create and update tasks')
      expect(intent.operations.length).toBeGreaterThan(0)
      const opNames = intent.operations.map((o) => o.name)
      expect(opNames).toEqual(expect.arrayContaining(['CreateTask']))
    })

    it('defaults to CreateRecord when no operations matched', () => {
      const intent = parseIntent('Something generic')
      const opNames = intent.operations.map((o) => o.name)
      expect(opNames).toEqual(['CreateRecord'])
    })
  })

  describe('HITL Questions', () => {
    it('adds payment questions when payments mentioned', () => {
      const intent = parseIntent('Clients make payments')
      expect(intent.questions.join(' ').toLowerCase()).toContain('guest')
      expect(intent.questions.join(' ').toLowerCase()).toContain('recurring')
    })

    it('adds subscription questions', () => {
      const intent = parseIntent('Users subscribe monthly')
      expect(intent.questions.join(' ').toLowerCase()).toContain('recurring')
    })

    it('adds team permission questions', () => {
      const intent = parseIntent('Team members collaborate')
      expect(intent.questions.join(' ').toLowerCase()).toContain('role-based')
    })

    it('adds inventory questions for e-commerce', () => {
      const intent = parseIntent('Store sells products')
      expect(intent.questions.join(' ').toLowerCase()).toContain('inventory')
    })

    it('adds booking approval questions', () => {
      const intent = parseIntent('Users book appointments')
      expect(intent.questions.join(' ').toLowerCase()).toContain('approval')
    })
  })
})
