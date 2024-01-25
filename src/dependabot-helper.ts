import {PathLike} from 'fs'
import * as core from '@actions/core'
import * as github from '@actions/github'
import {getExtractor} from './entries/extractor-factory'
import {DefaultChangelogUpdater, newUpdater} from './changelog-updater'
import {parseLabels} from './label-extractor'
import {pullRequestHasLabels} from './label-checker'

export async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version')
    const label: string = core.getInput('activationLabel')
    const labelsString: string = core.getInput('activationLabels')
    const changelogPath: PathLike = core.getInput('changelogPath')
    const entryPrefix: string = core.getInput('entryPrefix')
    const sectionHeader: string = core.getInput('sectionHeader')
    const payload = github.context.payload

    if (label !== '' && label !== 'dependabot') {
      core.warning('`activationLabel` is deprecated, use `activationLabels` instead')
    }

    const labels = parseLabels(labelsString)
    if (label !== '' && !labels.includes(label)) {
      labels.push(label)
    }

    if (labels.length > 0 && pullRequestHasLabels(payload, labels)) {
      const updater = newUpdater(
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

run()
