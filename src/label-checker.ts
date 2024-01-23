import {WebhookPayload} from '@actions/github/lib/interfaces'
import * as core from '@actions/core'

export function pullRequestHasLabels(
  payload: WebhookPayload,
  labels: string[]
): boolean {
  const prLabels = getPullRequestLabels(payload)
  let found = true
  for (const activationLabel of labels) {
    found = found && prLabels.includes(activationLabel)
    if (!found) {
      core.info(`Label '${activationLabel}' not found in pull request labels`)
    }
  }
  return found
}

function getPullRequestLabels(payload: WebhookPayload): string[] {
  return payload.pull_request!.labels.map((l: {name?: string}) => l.name)
}
