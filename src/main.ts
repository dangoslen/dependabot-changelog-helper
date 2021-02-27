import * as core from '@actions/core'
import { PathLike } from 'fs'
import { DependabotEntry, getDependabotEntry } from './entry-extractor'
import { addDependabotEntry } from './changelog-updater'

async function run(): Promise<void> {
  try {
    const version : string = 'UNRELEASED'
    const changelogPath : PathLike ='./CHANGELOG.md'
    const title : string = getPullRequestTitle()
    const entry : DependabotEntry = getDependabotEntry(title)

    addDependabotEntry(entry, version, changelogPath)

  } catch (error) {
    core.setFailed(error.message)
  }
}

function getPullRequestTitle() : string {
  return 'Bump package from 1.0 to 2.0'
}

run()
