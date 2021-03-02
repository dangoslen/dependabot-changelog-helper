import {PathLike} from 'fs'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {DependabotEntry, getDependabotEntry} from './entry-extractor'
import {updateChangelog} from './changelog-updater'

async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version')
    const changelogPath: PathLike = core.getInput('changelogPath')
    const label: string = core.getInput('label')
    const newVersionLineNumber = Number(core.getInput('newVersionLineNumber'))

    if (label !== '' && pullRequestHasLabel(label)) {
      const entry: DependabotEntry = getDependabotEntry(github.context.payload.pull_request)
      await updateChangelog(entry, version, newVersionLineNumber, changelogPath)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

function pullRequestHasLabel(label: string): boolean {
  return getPullRequestLabels().includes(label)
}

function getPullRequestLabels(): string[] {
  return github.context.payload.pull_request!.labels.map(
    (l: Map<string, string>) => l.get['name']
  )
}

run()
