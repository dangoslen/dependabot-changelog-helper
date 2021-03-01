import {PathLike} from 'fs'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {DependabotEntry, getDependabotEntry} from './entry-extractor'
import {addDependabotEntry} from './changelog-updater'

async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version')
    const changelogPath: PathLike = core.getInput('changelogPath')
    const label: string = core.getInput('label')
    const newVersionLineNumber: number = Number(core.getInput('newVersionLineNumber'))

    if (label != '' && pullRequestHasLabel(label)) {
      const title: string = getPullRequestTitle()
      const entry: DependabotEntry = getDependabotEntry(title)

      await addDependabotEntry(entry, version, newVersionLineNumber, changelogPath)
    }
  } catch (error) {
    core.setFailed(error.message)
  }
}

function pullRequestHasLabel(label: string) : boolean {
  return getPullRequestLabels().includes(label)
}

function getPullRequestTitle(): string { 
  return  github.context.payload.pull_request.title
}

function getPullRequestLabels(): string[] {
  return github.context.payload.pull_request.labels.map((l:any) => l.name)
}

run()
