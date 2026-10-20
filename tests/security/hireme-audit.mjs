// The original source-level vulnerability observations are archived in
// docs/aura/review/backend-security/source-probes.json. Re-run the fixed behavior
// tests instead of asserting that the historical vulnerabilities still exist.
import {spawnSync} from 'node:child_process'
import {fileURLToPath} from 'node:url'
const root=fileURLToPath(new URL('../../',import.meta.url))
const result=spawnSync(process.execPath,['--test','backend-hireme/test/security.test.ts','backend-hireme/test/hire-service.test.ts'],{cwd:root,stdio:'inherit'})
process.exitCode=result.status ?? 1
