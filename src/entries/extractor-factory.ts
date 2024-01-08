import {WebhookPayload} from '@actions/github/lib/interfaces'
import {DependabotExtractor} from './dependabot-extractor'
import {EntryExtractor} from './entry-extractor'

// Determines which extractor to use based on the PR
export function getExtractor(_: WebhookPayload): EntryExtractor {
  return new DependabotExtractor()
}
