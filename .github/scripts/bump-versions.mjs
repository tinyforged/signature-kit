import { readFileSync, writeFileSync } from 'fs'
import { execSync } from 'child_process'

const version = process.env.VERSION
if (!version) throw new Error('VERSION env is required')

const packages = [
  '@tinyforged/signature-kit',
  '@tinyforged/signature-kit-react',
  '@tinyforged/signature-kit-vue',
]

for (const pkg of packages) {
  const file = execSync(`pnpm --filter ${pkg} exec node -e "console.log(process.cwd())"`, {
    encoding: 'utf8',
  }).trim()
  const pkgPath = `${file}/package.json`
  const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf8'))
  pkgJson.version = version
  if (pkg !== '@tinyforged/signature-kit') {
    pkgJson.dependencies['@tinyforged/signature-kit'] = `^${version}`
  }
  writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n')
}

execSync('pnpm install --no-frozen-lockfile', { stdio: 'inherit' })
