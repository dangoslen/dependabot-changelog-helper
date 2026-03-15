import {WebhookPayload} from '@actions/github/lib/interfaces'
import {EntryExtractor, VersionEntry} from './entry-extractor'
import {EOL} from 'os'

export class DependabotExtractor implements EntryExtractor {
  private regex: RegExp

  constructor() {
    /** Regex explanation
     *   --- Start of the line must not be a '<li>' HTML tag which is used to denote a list within the <summary> tag
     *      --- Matches [Bump, bump, Bumps, bumps, Update, update, Updates or update], without capturing it
     *      |                           --- Matches any non-whitespace character; matching as a few as possible
     *      |                           |          --- Matches any non-whitespace character as the package name
     *      |                           |          |                   --- Matches any non-whitespace character as the old version (optional, "from" might not exist)
     *      |                           |          |                   |                 --- Matches any non-whitespace character as the new version
     *      |                           |          |                   |                 |
     */
    this.regex = new RegExp(
      // eslint-disable-next-line no-useless-escape
      /^(?!<li\>).*(?:(?:U|u)pdate|(?:B|b)ump)s? (\S+?) (?:requirement )?(?:from (\S*) )?to (\S*)/
    )
  }

  getEntries(event: WebhookPayload): VersionEntry[] {
    const pullRequestNumber: number = event.pull_request!.number
    const pullRequestUrl = event.pull_request!.html_url
    const repository: string | undefined = event.repository?.full_name
    const titleResult = this.regex.exec(event.pull_request!.title)
    if (titleResult !== null) {
      return [
        {
          pullRequestNumber,
          pullRequestUrl,
          repository,
          package: titleResult[1],
          oldVersion: titleResult[2],
          newVersion: titleResult[3]
        }
      ]
    }

    const body = event.pull_request!.body ?? ''
    const entries = this.getEntriesFromBody(
      pullRequestNumber,
      pullRequestUrl,
      repository,
      body
    )
    if (entries.length === 0) {
      throw new Error('No dependabot entries! found')
    }

    return entries
  }

  getEntriesFromBody(
    pullRequestNumber: number,
    pullRequestUrl: string | undefined,
    repository: string | undefined,
    body: string
  ): VersionEntry[] {
    // Instead of dealing with multiline strings, split the body into lines
    // and check each line individually
    const lines = body.split(EOL)
    const entries: VersionEntry[] = []
    for (const line of lines) {
      const match = this.regex.exec(line)
      if (match === null) {
        continue
      }

      // Remove backticks from the package name
      const pckge = match[1].replaceAll('`', '')
      const oldVersion = match[2]
      const newVersion = match[3]
      entries.push({
        pullRequestNumber,
        pullRequestUrl,
        repository,
        package: pckge,
        oldVersion,
        newVersion
      })
    }
    return entries
  }
}
