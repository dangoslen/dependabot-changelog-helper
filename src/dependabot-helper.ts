import {PathLike} from 'fs'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {getExtractor} from './entries/extractor-factory'
import {ChangelogUpdater} from './changelog-updater'

async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version')
    const label: string = core.getInput('activationLabel')
    const changelogPath: PathLike = core.getInput('changelogPath')
    const entryPrefix: string = core.getInput('entryPrefix')
    const sectionHeader: string = core.getInput('sectionHeader')
    const payload = github.context.payload

    if (label !== '' && pullRequestHasLabel(label)) {
      const updater = new ChangelogUpdater(
        version,
        changelogPath,
        entryPrefix,
        sectionHeader
      )
      const extractor = getExtractor(payload)

      updater.readChangelog()
      for (const entry of extractor.getEntries(payload)) {
        await updater.updateChangelog(entry)
      }
      await updater.writeChangelog()
    }
  } catch (err) {
    if (err instanceof Error) {
      core.setFailed(err.message)
    } else {
      core.setFailed(`Unexpected error ${err}`)
    }
  }
}

function pullRequestHasLabel(label: string): boolean {
  return getPullRequestLabels().includes(label)
}

function getPullRequestLabels(): string[] {
  return github.context.payload.pull_request!.labels.map(
    (l: {name?: string}) => l.name
  )
}

run()
