import * as core from '@actions/core'
import * as github from '@actions/github'
import {PathLike} from 'fs'
import {newUpdater} from './changelog-updater'
import {getExtractor} from './entries/extractor-factory'
import {pullRequestHasLabels} from './label-checker'
import {parseLabels} from './label-extractor'

export async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version')
    const dependencyTool: string = core.getInput('dependencyTool')
    const labelsString: string = core.getInput('activationLabels')
    const changelogPath: PathLike = core.getInput('changelogPath')
    const entryPrefix: string = core.getInput('entryPrefix')
    const sectionHeader: string = core.getInput('sectionHeader')
    const sort: string = core.getInput('sort')
    const pullRequestLinkFormat: string = core.getInput('pullRequestLinkFormat')
    const payload = github.context.payload

    // Parse the labels and push the dependency too as the label
    // if no labels are provided
    const labels = parseLabels(labelsString)
    if (labels.length === 0) {
      labels.push(dependencyTool)
    }
    if (pullRequestHasLabels(payload, labels)) {
      const updater = newUpdater(
        version,
        changelogPath,
        entryPrefix,
        sectionHeader,
        sort,
        pullRequestLinkFormat
      )
      const extractor = getExtractor(payload, {dependencyTool})
      const entries = extractor.getEntries(payload)
      await updater.readChangelog()
      await updater.addEntries(entries)
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

run()
