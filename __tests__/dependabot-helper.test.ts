import * as core from '@actions/core'
import * as updater from '../src/changelog-updater'
import * as factory from '../src/entries/extractor-factory'

import {run} from '../src/dependabot-helper'

jest.mock('@actions/core')

describe('run', () => {
  beforeEach(() => {
    jest.resetAllMocks()
  })

  test('should use activationLabels only', () => {
    const mockGetInput = jest.spyOn(core, 'getInput')

    const mockUpdater = {
      readChangelog: jest.fn(),
      updateChangelog: jest.fn(),
      writeChangelog: jest.fn()
    }

    const mockExtractor = {
      getEntries: jest.fn().mockReturnValue([
        {
          pullRequestNumber: 123,
          repository: 'repo',
          package: 'package',
          oldVersion: 'v2',
          newVersion: 'v3'
        }
      ])
    }

    mockGetInput
      .mockReturnValueOnce('1.0.0') // version
      .mockReturnValueOnce('label') // activationLabel
      .mockReturnValueOnce('dependabot-helper') // activationLabels
      .mockReturnValueOnce('/path/to/changelog.md') // changelogPath
      .mockReturnValueOnce('Bump') // entryPrefix
      .mockReturnValueOnce('Dependencies') // sectionHeader

    jest.spyOn(factory, 'getExtractor').mockReturnValue(mockExtractor)
    jest.spyOn(updater, 'newUpdater').mockReturnValue(mockUpdater)

    run().then(() => {
      expect(mockUpdater.readChangelog).toHaveBeenCalled()
      expect(mockExtractor.getEntries).toHaveBeenCalled()
      expect(mockUpdater.updateChangelog).toHaveBeenCalledWith({
        pullRequestNumber: 123,
        repository: 'repo',
        package: 'package',
        oldVersion: 'v2',
        newVersion: 'v3'
      })
      expect(mockUpdater.writeChangelog).toHaveBeenCalled()
      expect(core.setFailed).not.toHaveBeenCalled()
    })
  })

  test('should use activationLabels when there are multiple labels', () => {
    const mockGetInput = jest.spyOn(core, 'getInput')

    const mockUpdater = {
      readChangelog: jest.fn(),
      updateChangelog: jest.fn(),
      writeChangelog: jest.fn()
    }

    const mockExtractor = {
      getEntries: jest.fn().mockReturnValue([])
    }

    mockGetInput
      .mockReturnValueOnce('1.0.0') // version
      .mockReturnValueOnce('') // activationLabel
      .mockReturnValueOnce('dependabot-helper,missing') // activationLabels
      .mockReturnValueOnce('/path/to/changelog.md') // changelogPath
      .mockReturnValueOnce('Bump') // entryPrefix
      .mockReturnValueOnce('Dependencies') // sectionHeader

    jest.spyOn(factory, 'getExtractor').mockReturnValue(mockExtractor)
    jest.spyOn(updater, 'newUpdater').mockReturnValue(mockUpdater)

    run().then(() => {
      expect(mockUpdater.readChangelog).not.toHaveBeenCalled()
      expect(mockExtractor.getEntries).not.toHaveBeenCalled()
      expect(mockUpdater.updateChangelog).not.toHaveBeenCalled()
      expect(mockUpdater.writeChangelog).not.toHaveBeenCalled()
      expect(core.setFailed).not.toHaveBeenCalled()
    })
  })

  test('use the activation label only when activationLabels are empty', () => {
    const mockGetInput = jest.spyOn(core, 'getInput')

    const mockUpdater = {
      readChangelog: jest.fn(),
      updateChangelog: jest.fn(),
      writeChangelog: jest.fn()
    }

    const mockExtractor = {
      getEntries: jest.fn().mockReturnValue([
        {
          pullRequestNumber: 123,
          repository: 'repo',
          package: 'package',
          oldVersion: 'v2',
          newVersion: 'v3'
        }
      ])
    }

    mockGetInput
      .mockReturnValueOnce('1.0.0') // version
      .mockReturnValueOnce('dependabot-helper') // activationLabel
      .mockReturnValueOnce('') // activationLabels
      .mockReturnValueOnce('/path/to/changelog.md') // changelogPath
      .mockReturnValueOnce('Bump') // entryPrefix
      .mockReturnValueOnce('Dependencies') // sectionHeader

    jest.spyOn(factory, 'getExtractor').mockReturnValue(mockExtractor)
    jest.spyOn(updater, 'newUpdater').mockReturnValue(mockUpdater)

    run().then(() => {
      expect(mockUpdater.readChangelog).toHaveBeenCalled()
      expect(mockExtractor.getEntries).toHaveBeenCalled()
      expect(mockUpdater.updateChangelog).toHaveBeenCalledWith({
        pullRequestNumber: 123,
        repository: 'repo',
        package: 'package',
        oldVersion: 'v2',
        newVersion: 'v3'
      })
      expect(mockUpdater.writeChangelog).toHaveBeenCalled()
      expect(core.setFailed).not.toHaveBeenCalled()
    })
  })
})
