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
  const deltaArg = (arg('--delta') || arg('-d')) as string | boolean | undefined
  const withDeployment = Boolean(arg('--with-deployment'))
  const apply = Boolean(arg('--apply'))

  let delta: string | undefined
  if (typeof deltaArg === 'string') delta = deltaArg

  const cwd = process.cwd()
  const agenticDir = path.join(cwd, 'agentic')
  const lastIntentPath = path.join(agenticDir, 'last-intent.txt')

  if (!fs.existsSync(lastIntentPath)) {
    console.error('No previous intent found. Run agentic:orchestrate first.')
    process.exit(1)
  }
  if (!delta) {
    console.error('Usage: npm run agentic:refine -- --delta "change description" [--apply] [--with-deployment]')
    process.exit(1)
  }

  const prev = fs.readFileSync(lastIntentPath, 'utf8')
  const merged = `${prev}\n${delta}`

  console.log('➡️  Refining with delta:')
  console.log(delta)
  console.log('')

  const { artifacts, logs } = await orchestrate(merged, { withDeployment })

  const plan = planWrites(artifacts, { overwrite: false })
  console.log('📝 Write Plan (preview):')
  console.log(preview(plan))

  if (apply) {
    if (!fs.existsSync(agenticDir)) fs.mkdirSync(agenticDir, { recursive: true })
    fs.writeFileSync(lastIntentPath, merged, 'utf8')

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
