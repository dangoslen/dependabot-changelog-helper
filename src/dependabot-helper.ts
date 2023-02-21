import {PathLike} from 'fs'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {DependabotEntry, getDependabotEntry} from './entry-extractor'
import {updateChangelog} from './changelog-updater'

async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version')
    const label: string = core.getInput('activationLabel')
    const changelogPath: PathLike = core.getInput('changelogPath')
    const entryPrefix: string = core.getInput('entryPrefix')

    if (label !== '' && pullRequestHasLabel(label)) {
      const entry: DependabotEntry = getDependabotEntry(github.context.payload)
      await updateChangelog(entry, version, changelogPath, entryPrefix)
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
