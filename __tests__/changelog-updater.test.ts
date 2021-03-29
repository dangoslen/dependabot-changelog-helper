import {updateChangelog} from '../src/changelog-updater'
import {DependabotEntry} from '../src/entry-extractor'

const {Readable} = require('stream')
const fs = require('fs')

const PACKAGE_ENTRY: DependabotEntry = {
  pullRequestNumber: 123,
  package: 'package',
  newVersion: 'v2',
  oldVersion: 'v1'
}

jest.mock('fs')

const CHANGELOG_WITH_PROPER_SECTIONS_AND_ENTRIES = `# Changelog

## [UNRELEASED]
### Dependencies
- Bumps \`different-package\` from v1 to v2`

test('adds an entry to the changelog - section already exists with entry', async () => {
  const readable = Readable.from([CHANGELOG_WITH_PROPER_SECTIONS_AND_ENTRIES])
  fs.createReadStream.mockReturnValue(readable)
  fs.readFileSync.mockReturnValue(CHANGELOG_WITH_PROPER_SECTIONS_AND_ENTRIES)

  await updateChangelog(PACKAGE_ENTRY, 'UNRELEASED', 2, './CHANGELOG.md')

  const params = fs.writeFileSync.mock.calls[0]
  expect(params[0]).toStrictEqual('./CHANGELOG.md')
  expect(params[1]).toStrictEqual(`# Changelog

## [UNRELEASED]
### Dependencies
- Bumps \`different-package\` from v1 to v2
- Bumps \`package\` from v1 to v2`)
})

const CHANGELOG_WITH_PROPER_SECTIONS = `# Changelog

## [UNRELEASED]
### Dependencies`

test('adds an entry to the changelog - section already exists, but no entry', async () => {
  const readable = Readable.from([CHANGELOG_WITH_PROPER_SECTIONS])
  fs.createReadStream.mockReturnValue(readable)
  fs.readFileSync.mockReturnValue(CHANGELOG_WITH_PROPER_SECTIONS)

  await updateChangelog(PACKAGE_ENTRY, 'UNRELEASED', 2, './CHANGELOG.md')

  const params = fs.writeFileSync.mock.calls[0]
  expect(params[0]).toStrictEqual('./CHANGELOG.md')
  expect(params[1]).toStrictEqual(`# Changelog

## [UNRELEASED]
### Dependencies
- Bumps \`package\` from v1 to v2`)
})

const CHANGELOG_MISSING_DEPENDECIES = `# Changelog

## [UNRELEASED]`

test('adds an entry to the changelog - section does not exist, but version does', async () => {
  const readable = Readable.from([CHANGELOG_MISSING_DEPENDECIES])
  fs.createReadStream.mockReturnValue(readable)
  fs.readFileSync.mockReturnValue(CHANGELOG_MISSING_DEPENDECIES)

  await updateChangelog(PACKAGE_ENTRY, 'UNRELEASED', 2, './CHANGELOG.md')

  const params = fs.writeFileSync.mock.calls[0]
  expect(params[0]).toStrictEqual('./CHANGELOG.md')
  expect(params[1]).toStrictEqual(`# Changelog

## [UNRELEASED]
### Dependencies
- Bumps \`package\` from v1 to v2`)
})

const CHANGELOG_WITH_MULTIPLE_VERSIONS = `# Changelog

## [UNRELEASED]
### Dependencies
- Bumps \`different-package\` from v1 to v2

## [v1.0.0]
### Dependencies
- Bumps \`foo\` from bar to foo-bar
`

test('adds an entry to the changelog - multiple versions', async () => {
  const readable = Readable.from([CHANGELOG_WITH_MULTIPLE_VERSIONS])
  fs.createReadStream.mockReturnValue(readable)
  fs.readFileSync.mockReturnValue(CHANGELOG_WITH_MULTIPLE_VERSIONS)

  await updateChangelog(PACKAGE_ENTRY, 'UNRELEASED', 2, './CHANGELOG.md')

  const params = fs.writeFileSync.mock.calls[0]
  expect(params[0]).toStrictEqual('./CHANGELOG.md')
  expect(params[1]).toStrictEqual(`# Changelog

## [UNRELEASED]
### Dependencies
- Bumps \`different-package\` from v1 to v2
- Bumps \`package\` from v1 to v2

## [v1.0.0]
### Dependencies
- Bumps \`foo\` from bar to foo-bar`)
})

const CHANGELOG_WITH_NO_VERSION = `# Changelog

## [v1.0.0]
### Dependencies
- Bumps \`foo\` from bar to foo-bar
`

test('adds an entry to the changelog - no version section', async () => {
  const readable = Readable.from([CHANGELOG_WITH_NO_VERSION])
  fs.createReadStream.mockReturnValue(readable)
  fs.readFileSync.mockReturnValue(CHANGELOG_WITH_NO_VERSION)

  await updateChangelog(PACKAGE_ENTRY, 'UNRELEASED', 2, './CHANGELOG.md')

  const params = fs.writeFileSync.mock.calls[0]
  expect(params[0]).toStrictEqual('./CHANGELOG.md')
  expect(params[1]).toStrictEqual(`# Changelog

## [UNRELEASED]
### Dependencies
- Bumps \`package\` from v1 to v2

## [v1.0.0]
### Dependencies
- Bumps \`foo\` from bar to foo-bar`)
})

const CHANGELOG_WITH_DUPLICATE_ENTRY = `# Changelog

## [v1.0.0]
### Dependencies
- Bumps \`package\` from v1 to v2`

test('does not update the changelog on duplicate entry', async () => {
  const readable = Readable.from([CHANGELOG_WITH_DUPLICATE_ENTRY])
  fs.createReadStream.mockReturnValue(readable)
  fs.readFileSync.mockReturnValue(CHANGELOG_WITH_DUPLICATE_ENTRY)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', 2, './CHANGELOG.md')

  expect(fs.writeFileSync).toBeCalledTimes(0)
})

const CHANGELOG_WITH_DUPLICATE_ENTRY_NOT_LAST_LINE = `# Changelog

## [v1.0.0]
### Dependencies
- Bumps \`package\` from v1 to v2

## [v0.9.0]
### Added
- Something`

test('does not update the changelog on duplicate entry when not the list item', async () => {
  const readable = Readable.from([CHANGELOG_WITH_DUPLICATE_ENTRY_NOT_LAST_LINE])
  fs.createReadStream.mockReturnValue(readable)
  fs.readFileSync.mockReturnValue(CHANGELOG_WITH_DUPLICATE_ENTRY_NOT_LAST_LINE)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', 2, './CHANGELOG.md')

  expect(fs.writeFileSync).toBeCalledTimes(0)
})

const CHANGELOG_WITH_DUPLICATE_ENTRY_NOT_IN_DIFFERENT_VERSION = `# Changelog

## [v1.0.0]
### Dependencies
- Bumps \`package\` from v1 to v2

## [v0.9.0]
### Added
- Something`

test('does not update the changelog on duplicate entry when not the list item', async () => {
  const readable = Readable.from([
    CHANGELOG_WITH_DUPLICATE_ENTRY_NOT_IN_DIFFERENT_VERSION
  ])
  fs.createReadStream.mockReturnValue(readable)
  fs.readFileSync.mockReturnValue(
    CHANGELOG_WITH_DUPLICATE_ENTRY_NOT_IN_DIFFERENT_VERSION
  )

  await updateChangelog(PACKAGE_ENTRY, 'UNRELEASED', 2, './CHANGELOG.md')

  const params = fs.writeFileSync.mock.calls[0]
  expect(params[0]).toStrictEqual('./CHANGELOG.md')
  expect(params[1]).toStrictEqual(
    `# Changelog

## [UNRELEASED]
### Dependencies
- Bumps \`package\` from v1 to v2

## [v1.0.0]
### Dependencies
- Bumps \`package\` from v1 to v2

## [v0.9.0]
### Added
- Something`
  )
})

const CHANGELOG_WITH_ENTRY_TO_UPDATE = `# Changelog

## [v1.0.0]
### Dependencies
- Bumps \`package\` from v1 to v1.1`

test('updates and entry for an existing package in the same version', async () => {
  const readable = Readable.from([CHANGELOG_WITH_ENTRY_TO_UPDATE])
  fs.createReadStream.mockReturnValue(readable)
  fs.readFileSync.mockReturnValue(CHANGELOG_WITH_ENTRY_TO_UPDATE)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', 2, './CHANGELOG.md')

  const params = fs.writeFileSync.mock.calls[0]
  expect(params[0]).toStrictEqual('./CHANGELOG.md')
  expect(params[1]).toStrictEqual(
    `# Changelog

## [v1.0.0]
### Dependencies
- Bumps \`package\` from v1 to v2`
  )
})

const CHANGELOG_WITH_VERSION_MISSING_DEP_SECTION_BUT_HAS_OTHERS = `# Changelog

## [v1.0.0]
### Added
### Removed`

test('updates version with new section and entry', async () => {
  const readable = Readable.from([
    CHANGELOG_WITH_VERSION_MISSING_DEP_SECTION_BUT_HAS_OTHERS
  ])
  fs.createReadStream.mockReturnValue(readable)
  fs.readFileSync.mockReturnValue(
    CHANGELOG_WITH_VERSION_MISSING_DEP_SECTION_BUT_HAS_OTHERS
  )

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', 2, './CHANGELOG.md')

  const params = fs.writeFileSync.mock.calls[0]
  expect(params[0]).toStrictEqual('./CHANGELOG.md')
  expect(params[1]).toStrictEqual(
    `# Changelog

## [v1.0.0]
### Added
### Removed
### Dependencies
- Bumps \`package\` from v1 to v2`
  )
})

const CHANGELOG_WITH_MULTI_VERSION_PACKAGE_UPDATES = `# Changelog

## [v1.0.0]
### Dependencies
- Bumps \`package\` from v1 to v1.1

## [v0.9.0]
### Dependencies
- Bumps \`package\` from alpha to v1`

test('Does not update lines additional times', async () => {
  mockFiles(CHANGELOG_WITH_MULTI_VERSION_PACKAGE_UPDATES)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', 2, './CHANGELOG.md')

  const params = fs.writeFileSync.mock.calls[0]
  expect(params[0]).toStrictEqual('./CHANGELOG.md')
  expect(params[1]).toStrictEqual(
    `# Changelog

## [v1.0.0]
### Dependencies
- Bumps \`package\` from v1 to v2

## [v0.9.0]
### Dependencies
- Bumps \`package\` from alpha to v1`
  )
})

function mockFiles(changelog: string) {
  const readable = Readable.from([changelog])
  fs.createReadStream.mockReturnValue(readable)
  fs.readFileSync.mockReturnValue(changelog)
}
