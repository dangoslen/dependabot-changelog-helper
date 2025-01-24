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

    // Renovate uses a table format in its PR description
    // Example:
    // | Package | Changes |
    // | --- | --- | --- |
    // | [package-name](link.com) | [1.0.0 -> 2.0.0](link.com) |
    const lines = body.split('\n')
    let inDependencyTable = false
    for (const line of lines) {
      if (line.startsWith('| Package | Changes |')) {
        inDependencyTable = true
        continue
      }

      if (inDependencyTable && line.startsWith('|')) {
        const [_, pkg, changes, __] = line.split('|').map(s => s.trim())

        if (pkg && changes) {
          const pkgName = this.linkRegex.exec(pkg)?.[1]
          const linkText = this.linkRegex.exec(changes)?.[1]

          const [oldVersion, newVersion] = (linkText?.split('->') ?? []).map(
            v => v.trim()
          )

          if (pkgName && oldVersion && newVersion) {
            entries.push({
              pullRequestNumber: event.pull_request?.number || 0,
              repository: undefined,
              package: pkgName,
              oldVersion,
              newVersion
            })
          }
        }
      } else if (inDependencyTable && !line.startsWith('|')) {
        inDependencyTable = false
      }
    }
    return entries
  }
}
