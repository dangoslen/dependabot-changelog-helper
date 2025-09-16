import {WebhookPayload} from '@actions/github/lib/interfaces'

export interface VersionEntry {
  pullRequestNumber: number
  repository: string | undefined
  package: string
  oldVersion?: string
  newVersion: string
}

export interface EntryExtractor {
  getEntries(event: WebhookPayload): VersionEntry[]
}
