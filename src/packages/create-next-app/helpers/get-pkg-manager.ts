export type PackageManager = 'flight' | 'npm' | 'pnpm' | 'yarn'

export function getPkgManager(): PackageManager {
  return 'flight'
}
