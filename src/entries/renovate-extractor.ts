import {WebhookPayload} from '@actions/github/lib/interfaces'
import {EntryExtractor, VersionEntry} from './entry-extractor'

export class RenovateExtractor implements EntryExtractor {
  private linkRegex: RegExp

  constructor() {
    this.linkRegex = new RegExp(/\[([^\]]+)\]\(([^)]+)\)/)
  }

  getEntries(event: WebhookPayload): VersionEntry[] {
    const entries: VersionEntry[] = []
    const body = event.pull_request?.body

    if (!body) {
      return entries
    }

    // Renovate uses different table formats in its PR description
    // Examples:
    // | Package | Changes |
    // | --- | --- | --- |
    // | [package-name](link.com) | [1.0.0 -> 2.0.0](link.com) |
    //
    // | Package | Type | Update | Change |
    // | --- | --- | --- | --- |
    // | [ghcr.io/renovatebot/renovate](https://renovatebot.com) ([source](https://github.com/renovatebot/renovate)) | container | minor | `41.100.0` -> `41.109.0` |

    const lines = body.split('\n')
    let inDependencyTable = false
    let packageColumn = -1
    let changeColumn = -1
    for (const line of lines) {
      if (line.includes('| Package |')) {
        const columns = line
          .trim()
          .split('|')
          .map(s => s.trim())
        packageColumn = columns.indexOf('Package')
        changeColumn = columns.findIndex(v => v === 'Change' || v === 'Changes')

        inDependencyTable = packageColumn !== -1 && changeColumn !== -1
        continue
      }

      if (inDependencyTable && line.startsWith('|')) {
        const columns = line.split('|').map(s => s.trim())
        const pkg = columns[packageColumn]
        const changes = columns[changeColumn]

        if (pkg && changes) {
          const pkgName = this.extractPkgName(pkg)
          const versions = this.extractVersion(changes)

          if (pkgName && versions) {
            entries.push({
              pullRequestNumber: event.pull_request?.number || 0,
              repository: undefined,
              package: pkgName,
              oldVersion: versions.oldVersion,
              newVersion: versions.newVersion
            })
          }
        }
      } else if (inDependencyTable && !line.startsWith('|')) {
        inDependencyTable = false
      }
    }
    return entries
  }

  private extractPkgName(columnValue: string): string | undefined {
    return this.linkRegex.exec(columnValue)?.[1]
  }

  private extractVersion(
    columnValue: string
  ): {oldVersion: string; newVersion: string} | undefined {
    // the version change can be either in plaintext or as a markdown link
    // try to extract the value if it looks like a markdown link, else assume plaintext
    const versions = this.linkRegex.exec(columnValue)?.[1] ?? columnValue

    const [oldVersion, newVersion] = versions
      // the plaintext variant formats each version as `1.0.0` in backticks
      .replaceAll('`', '')
      .split('->')
      .map(v => v.trim())

    return oldVersion && newVersion ? {oldVersion, newVersion} : undefined
  }
}
