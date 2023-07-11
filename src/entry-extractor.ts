import {WebhookPayload} from '@actions/github/lib/interfaces'

/** Regex explanation
 *   --- Matches Bump, bump, Bumps, bumps, Update, update, Updates or update, without capturing it
 *  |     --- Matches any non-whitespace character; matching as a few as possible
 *  |     |          --- Matches any non-whitespace character
 *  |     |          |           --- Matches the text 'requirement ' or nothing, without capturing it
 *  |     |          |           |                --- Matches any non-whitespace character
 *  |     |          |           |                |
 */
const TITLE_REGEX = new RegExp(
  /(?:(?:U|u)pdate|(?:B|b)ump)s? (\S+?) (?:requirement )?from (\S*) to (\S*)/
)

export interface DependabotEntry {
  pullRequestNumber: number
  repository: string | undefined
  package: string
  oldVersion: string
  newVersion: string
}

export function getDependabotEntry(event: WebhookPayload): DependabotEntry {
  const pullRequestNumber: number = event.pull_request!.number
  const repository: string | undefined = event.repository?.full_name
  const titleResult = TITLE_REGEX.exec(event.pull_request!.title)
  if (titleResult === null) {
    throw new Error('Unable to extract entry from pull request title!')
  }

  return {
    pullRequestNumber,
    repository,
    package: titleResult[1],
    oldVersion: titleResult[2],
    newVersion: titleResult[3]
  }
}
