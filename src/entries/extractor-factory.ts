import {WebhookPayload} from '@actions/github/lib/interfaces'
import {DependabotExtractor} from './dependabot-extractor'
import {RenovateExtractor} from './renovate-extractor'
import {EntryExtractor} from './entry-extractor'

interface Config {
  dependencyTool: string
}

// Determines which extractor to use based on the PR
export function getExtractor(
  event: WebhookPayload,
  config: Config
): EntryExtractor {
  if (config.dependencyTool === 'renovate') {
    return new RenovateExtractor()
  }
  if (config.dependencyTool === 'dependabot') {
    // Default to Dependabot extractor
    return new DependabotExtractor()
  }
  throw new Error('Unknown dependency tool')
}
