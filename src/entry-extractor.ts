import {WebhookPayload} from '@actions/github/lib/interfaces'

const TITLE_REGEX = new RegExp(/Bumps? ([\w|\-|_]*) from (.*) to (.*)/)

export interface DependabotEntry {
  pullRequestNumber: number
  package: string
  oldVersion: string
  newVersion: string
}

export function getDependabotEntry(event: WebhookPayload): DependabotEntry {
  const pullRequestNumber: number = event.pull_request!.number
  const titleResult = TITLE_REGEX.exec(event.pull_request!.title)
  if (titleResult === null) {
    throw new Error('Unable to extract entry from pull request title!')
  }

  return {
    pullRequestNumber,
    package: titleResult[1],
    oldVersion: titleResult[2],
    newVersion: titleResult[3]
  }
}
