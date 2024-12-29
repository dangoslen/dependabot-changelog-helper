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
    const labelsString: string = core.getInput('activationLabels')
    const changelogPath: PathLike = core.getInput('changelogPath')
    const entryPrefix: string = core.getInput('entryPrefix')
    const sectionHeader: string = core.getInput('sectionHeader')
    const sort: string = core.getInput('sort')
    const payload = github.context.payload

    // If the `activationLabels` input is set, use it and ignore the `activationLabel` input
    const labels = parseLabels(labelsString)
    if (labels.length > 0 && pullRequestHasLabels(payload, labels)) {
      const updater = newUpdater(
        version,
        changelogPath,
        entryPrefix,
        sectionHeader,
        sort
      )
      const extractor = getExtractor(payload)
      const entries = extractor.getEntries(payload)
      updater.readChangelog()
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
