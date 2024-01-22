import {WebhookPayload} from '@actions/github/lib/interfaces'

export function pullRequestHasLabels(
  payload: WebhookPayload,
  labels: string[]
): boolean {
  const prLabels = getPullRequestLabels(payload)
  let found = true
  for (const activationLabel of labels) {
    found = found && prLabels.includes(activationLabel)
  }
  return found
}

function getPullRequestLabels(payload: WebhookPayload): string[] {
  return payload.pull_request!.labels.map((l: {name?: string}) => l.name)
}
