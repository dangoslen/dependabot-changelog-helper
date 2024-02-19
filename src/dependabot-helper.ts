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
    const label: string = core.getInput('activationLabel')
    const labelsString: string = core.getInput('activationLabels')
    const changelogPath: PathLike = core.getInput('changelogPath')
    const entryPrefix: string = core.getInput('entryPrefix')
    const sectionHeader: string = core.getInput('sectionHeader')
    const sort: string = core.getInput('sort')
    const payload = github.context.payload

    if (label !== '' && label !== 'dependabot') {
      core.warning(
        '`activationLabel` is deprecated, use `activationLabels` instead'
      )
    }

    // If the `activationLabels` input is not set, use the `activationLabel` input only
    // If the `activationLabels` input is set, use it and ignore the `activationLabel` input
    let labels = parseLabels(labelsString)
    if (labels.length === 0) {
      labels = [label]
    }

    if (labels.length > 0 && pullRequestHasLabels(payload, labels)) {
      const updater = newUpdater(
        version,
        changelogPath,
        entryPrefix,
        sectionHeader,
        sort
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

run()
