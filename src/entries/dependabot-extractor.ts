import {WebhookPayload} from '@actions/github/lib/interfaces'
import {EntryExtractor, VersionEntry} from './entry-extractor'

export class DependabotExtractor implements EntryExtractor {
  private regex: RegExp

  constructor() {
    /** Regex explanation
     *   --- Matches Bump, bump, Bumps, bumps, Update, update, Updates or update, without capturing it
     *  |     --- Matches any non-whitespace character; matching as a few as possible
     *  |     |          --- Matches any non-whitespace character
     *  |     |          |           --- Matches the text 'requirement ' or nothing, without capturing it
     *  |     |          |           |                --- Matches any non-whitespace character
     *  |     |          |           |                |
     */
    this.regex = new RegExp(
      /(?:(?:U|u)pdate|(?:B|b)ump)s? (\S+?) (?:requirement )?from (\S*) to (\S*)/
    )
  }

  getEntries(event: WebhookPayload): VersionEntry[] {
    const pullRequestNumber: number = event.pull_request!.number
    const repository: string | undefined = event.repository?.full_name
    const titleResult = this.regex.exec(event.pull_request!.title)
    if (titleResult !== null) {
      return [
        {
          pullRequestNumber,
          repository,
          package: titleResult[1],
          oldVersion: titleResult[2],
          newVersion: titleResult[3]
        }
      ]
    }

    const body = event.pull_request!.body ?? ''
    const entries = this.getEntriesFromBody(pullRequestNumber, repository, body)
    if (entries.length === 0) {
      throw new Error('No dependabot entries! found')
    }

    return entries
  }

  getEntriesFromBody(
    pullRequestNumber: number,
    repository: string | undefined,
    body: string
  ): VersionEntry[] {
    let description = body
    let match
    const entries: VersionEntry[] = []
    while ((match = this.regex.exec(description)) !== null) {
      entries.push({
        pullRequestNumber,
        repository,

        // Remove redundant '`' characters on packages pulled from the body
        package: match[1].replaceAll('`', ''),
        oldVersion: match[2],
        newVersion: match[3]
      })

      // Search after the previous match
      description = description.substring(match.index + match[0].length)
    }
    return entries
  }
}
