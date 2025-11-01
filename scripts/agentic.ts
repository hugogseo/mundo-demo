#!/usr/bin/env node

import fs from 'fs'
import path from 'path'
import { orchestrate } from '../lib/agentic/orchestrator'
import { planWrites, preview, applyWritePlan } from '../lib/agentic/writer'

function arg(flag: string): string | boolean | undefined {
  const i = process.argv.indexOf(flag)
  if (i === -1) return undefined
  const next = process.argv[i + 1]
  if (!next || next.startsWith('--')) return true
  return next
}

async function main() {
  const descArg = (arg('--desc') || arg('-d')) as string | boolean | undefined
  const withDeployment = Boolean(arg('--with-deployment'))
  const apply = Boolean(arg('--apply'))

  let description: string | undefined
  if (typeof descArg === 'string') description = descArg

  const cwd = process.cwd()
  const agenticDir = path.join(cwd, 'agentic')
  const lastIntentPath = path.join(agenticDir, 'last-intent.txt')

  if (!description && fs.existsSync(lastIntentPath)) {
    description = fs.readFileSync(lastIntentPath, 'utf8')
  }

  if (!description) {
    console.error('Usage: npm run agentic:orchestrate -- --desc "your SaaS description" [--apply] [--with-deployment]')
    process.exit(1)
  }

  console.log('➡️  Orchestrating with description:')
  console.log(description)
  console.log('')

  const { artifacts, logs } = await orchestrate(description, { withDeployment })

  const plan = planWrites(artifacts, { overwrite: false })
  console.log('📝 Write Plan (preview):')
  console.log(preview(plan))

  if (apply) {
    if (!fs.existsSync(agenticDir)) fs.mkdirSync(agenticDir, { recursive: true })
    fs.writeFileSync(lastIntentPath, description, 'utf8')

    const result = applyWritePlan(plan)
    console.log('')
    console.log('✅ Applied:')
    console.log(`Created: ${result.created}, Overwritten: ${result.overwritten}, Skipped: ${result.skipped}`)
  } else {
    console.log('')
    console.log('ℹ️  Dry-run only. Re-run with --apply to write files.')
  }

  if (logs?.length) {
    console.log('')
    console.log('📒 Logs:')
    for (const l of logs) console.log('-', l)
  }
}

main().catch((e) => {
  console.error('❌ Error:', e?.message || e)
  process.exit(1)
})
