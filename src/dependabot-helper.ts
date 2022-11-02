import {PathLike} from 'fs'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {DependabotEntry, getDependabotEntry} from './entry-extractor'
import {updateChangelog} from './changelog-updater'

async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version')
    const changelogPath: PathLike = core.getInput('changelogPath')
    const label: string = core.getInput('activationLabel')

    // Line numbers in files are read as 1-indexed, but we deal with contents as 0-indexed
    const newVersionLineNumber =
      Number(core.getInput('newVersionLineNumber')) - 1

    if (label !== '' && pullRequestHasLabel(label)) {
      const entry: DependabotEntry = getDependabotEntry(github.context.payload)
      await updateChangelog(entry, version, newVersionLineNumber, changelogPath)
    }
  } catch (error: any) {
    core.setFailed(error.message)
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
