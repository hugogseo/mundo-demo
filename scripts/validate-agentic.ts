#!/usr/bin/env node

import { spawnSync } from 'child_process'

function run(cmd: string, args: string[]) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', env: { ...process.env, PAGER: 'cat' } })
  return res.status ?? 1
}

async function main() {
  console.log('🔎 Validating TypeScript (no emit) ...')
  const status = run('npx', ['tsc', '--noEmit'])
  if (status !== 0) {
    console.error('❌ TypeScript validation failed')
    process.exit(status)
  }
  console.log('✅ TypeScript validation passed')
}

main().catch((e) => {
  console.error('❌ Error:', e?.message || e)
  process.exit(1)
})
