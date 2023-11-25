import {WebhookPayload} from '@actions/github/lib/interfaces'

/** Regex explanation
 *   --- Matches Bump, bump, Bumps, bumps, Update, update, Updates or update, without capturing it
 *  |     --- Matches any non-whitespace character; matching as a few as possible
 *  |     |          --- Matches any non-whitespace character
 *  |     |          |           --- Matches the text 'requirement ' or nothing, without capturing it
 *  |     |          |           |                --- Matches any non-whitespace character
 *  |     |          |           |                |
 */
const ENTRY_REGEX = new RegExp(
  /(?:(?:U|u)pdate|(?:B|b)ump)s? (\S+?) (?:requirement )?from (\S*) to (\S*)/
)

export interface DependabotEntry {
  pullRequestNumber: number
  repository: string | undefined
  package: string
  oldVersion: string
  newVersion: string
}

export function getDependabotEntries(event: WebhookPayload): DependabotEntry[] {
  const pullRequestNumber: number = event.pull_request!.number
  const repository: string | undefined = event.repository?.full_name
  const titleResult = ENTRY_REGEX.exec(event.pull_request!.title)
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
  const entries = getEntriesFromBody(pullRequestNumber, repository, body)
  if (entries.length === 0) {
    throw new Error('No dependabot entries! found')
  }

  return entries
}

function getEntriesFromBody(
  pullRequestNumber: number,
  repository: string | undefined,
  body: string
): DependabotEntry[] {
  let description = body
  let match
  const entries: DependabotEntry[] = []
  while ((match = ENTRY_REGEX.exec(description)) !== null) {
    entries.push({
      pullRequestNumber,
      repository,
      package: match[1],
      oldVersion: match[2],
      newVersion: match[3]
    })

    // Search after the previous match
    description = description.substring(match.index + match[0].length)
  }
  return entries
}
