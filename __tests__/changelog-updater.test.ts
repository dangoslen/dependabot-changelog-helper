import {FSWatcher, PathLike} from 'fs'
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

## [v1.0.0]
### Dependencies
- Bump \`different-package\` from v1 to v2`

test('adds an entry to the changelog when section already exists with section', async () => {
  mockReadStream(CHANGELOG_WITH_PROPER_SECTIONS_AND_ENTRIES)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')

  expectWrittenChangelogToBe(`# Changelog

## [v1.0.0]
### Dependencies
- Bump \`different-package\` from v1 to v2
- Bump \`package\` from v1 to v2 (#123)`)
})

const CHANGELOG_WITH_PROPER_SECTIONS_AND_ENTRIES_UNRELEASED = `# Changelog

## [UNRELEASED]
### Dependencies
- Bump \`different-package\` from v1 to v2`

test('adds an entry to the changelog when section exists under default unreleased version', async () => {
  mockReadStream(CHANGELOG_WITH_PROPER_SECTIONS_AND_ENTRIES_UNRELEASED)

  await updateChangelog(PACKAGE_ENTRY, 'nope', './CHANGELOG.md', 'Bump')

  expectWrittenChangelogToBe(`# Changelog

## [UNRELEASED]
### Dependencies
- Bump \`different-package\` from v1 to v2
- Bump \`package\` from v1 to v2 (#123)`)
})

const CHANGELOG_WITH_PROPER_SECTIONS_UNRELEASED = `# Changelog

## [UNRELEASED]
### Dependencies`

test('adds an entry to the changelog when section already exists, but no entry', async () => {
  mockReadStream(CHANGELOG_WITH_PROPER_SECTIONS_UNRELEASED)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')

  expectWrittenChangelogToBe(`# Changelog

## [UNRELEASED]
### Dependencies
- Bump \`package\` from v1 to v2 (#123)`)
})

const CHANGELOG_MISSING_DEPENDECIES = `# Changelog

## [UNRELEASED]`

test('adds an entry to the changelog when version exists but section does not', async () => {
  const readable = Readable.from([CHANGELOG_MISSING_DEPENDECIES])
  fs.createReadStream.mockReturnValue(readable)
  fs.readFileSync.mockReturnValue(CHANGELOG_MISSING_DEPENDECIES)

  await updateChangelog(PACKAGE_ENTRY, 'UNRELEASED', './CHANGELOG.md', 'Bump')

  expectWrittenChangelogToBe(`# Changelog

## [UNRELEASED]
### Dependencies
- Bump \`package\` from v1 to v2 (#123)`)
})

const CHANGELOG_WITH_MULTIPLE_VERSIONS = `# Changelog

## [UNRELEASED]
### Dependencies
- Bump \`different-package\` from v1 to v2

## [v1.0.0]
### Dependencies
- Bump \`foo\` from bar to foo-bar
`

test('adds an entry to the changelog - multiple versions', async () => {
  mockReadStream(CHANGELOG_WITH_MULTIPLE_VERSIONS)

  await updateChangelog(PACKAGE_ENTRY, 'UNRELEASED', './CHANGELOG.md', 'Bump')

  expectWrittenChangelogToBe(`# Changelog

## [UNRELEASED]
### Dependencies
- Bump \`different-package\` from v1 to v2
- Bump \`package\` from v1 to v2 (#123)

## [v1.0.0]
### Dependencies
- Bump \`foo\` from bar to foo-bar`)
})

const CHANGELOG_WITH_NO_VERSION = `# Changelog
`

test('errors when there is no version section', async () => {
  mockReadStream(CHANGELOG_WITH_NO_VERSION)

  try {
    await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')
  } catch (err) {
    expect(err).not.toBeNull()
    expect(fs.writeFileSync).toBeCalledTimes(0)
  }
})

const CHANGELOG_WITH_DUPLICATE_ENTRY = `# Changelog

## [v1.0.0]
### Dependencies
- Bump \`package\` from v1 to v2`

test('does not update the changelog on duplicate entry', async () => {
  mockReadStream(CHANGELOG_WITH_DUPLICATE_ENTRY)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')

  expect(fs.writeFileSync).toBeCalledTimes(0)
})

const CHANGELOG_WITH_DUPLICATE_ENTRY_NOT_LAST_LINE = `# Changelog

## [v1.0.0]
### Dependencies
- Bump \`package\` from v1 to v2

## [v0.9.0]
### Added
- Something`

test('does not update the changelog on duplicate entry when not the last item', async () => {
  mockReadStream(CHANGELOG_WITH_DUPLICATE_ENTRY_NOT_LAST_LINE)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')

  expect(fs.writeFileSync).toBeCalledTimes(0)
})

const CHANGELOG_WITH_ENTRY_TO_UPDATE = `# Changelog

## [v1.0.0]
### Dependencies
- Bump \`package\` from v1 to v1.1`

test('updates an entry for an existing package in the same version', async () => {
  mockReadStream(CHANGELOG_WITH_ENTRY_TO_UPDATE)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')

  expectWrittenChangelogToBe(
    `# Changelog

## [v1.0.0]
### Dependencies
- Bump \`package\` from v1 to v2 (#123)`
  )
})

const CHANGELOG_WITH_ENTRY_TO_UPDATE_WITH_PULL_REQUEST = `# Changelog

## [v1.0.0]
### Dependencies
- Bump \`package\` from v1 to v1.1 (#100)`

test('updates an entry with pull request context for an existing package in the same version', async () => {
  mockReadStream(CHANGELOG_WITH_ENTRY_TO_UPDATE_WITH_PULL_REQUEST)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')

  expectWrittenChangelogToBe(
    `# Changelog

## [v1.0.0]
### Dependencies
- Bump \`package\` from v1 to v2 (#100, #123)`
  )
})

const CHANGELOG_WITH_VERSION_MISSING_DEP_SECTION_BUT_HAS_OTHERS = `# Changelog

## [v1.0.0]
### Added
### Removed`

test('updates version with new section and entry', async () => {
  mockReadStream(CHANGELOG_WITH_VERSION_MISSING_DEP_SECTION_BUT_HAS_OTHERS)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')

  expectWrittenChangelogToBe(
    `# Changelog

## [v1.0.0]
### Added
### Removed
### Dependencies
- Bump \`package\` from v1 to v2 (#123)`
  )
})

const CHANGELOG_WITH_MULTI_VERSION_PACKAGE_UPDATES = `# Changelog

## [v1.0.0]
### Dependencies
- Bump \`package\` from v1 to v1.1 (#100, #101)

## [v0.9.0]
### Dependencies
- Bump \`package\` from alpha to v1`

test('does not update lines additional times', async () => {
  mockReadStream(CHANGELOG_WITH_MULTI_VERSION_PACKAGE_UPDATES)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')

  expectWrittenChangelogToBe(
    `# Changelog

## [v1.0.0]
### Dependencies
- Bump \`package\` from v1 to v2 (#100, #101, #123)

## [v0.9.0]
### Dependencies
- Bump \`package\` from alpha to v1`
  )
})

test('does not update lines additional times, even with multiple invocations', async () => {
  mockReadStream(CHANGELOG_WITH_MULTI_VERSION_PACKAGE_UPDATES)

  // Run twice to make sure we only add the PR context once
  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')
  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')

  expectWrittenChangelogToBe(
    `# Changelog

## [v1.0.0]
### Dependencies
- Bump \`package\` from v1 to v2 (#100, #101, #123)

## [v0.9.0]
### Dependencies
- Bump \`package\` from alpha to v1`,
    2
  )
})

const CHANGELOG_WITH_EXISTING_SECTION_AND_SEPARATED_SECTIONS = `# Changelog

## [v1.0.0]

### Added
- Added a new feature

### Dependencies
- Bump \`other-package\` from v2 to v3

## [v0.9.0]

### Dependencies
- Bump \`package\` from alpha to v1`

test('updates existing section when sections separated by blank lines', async () => {
  mockReadStream(CHANGELOG_WITH_EXISTING_SECTION_AND_SEPARATED_SECTIONS)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')

  expectWrittenChangelogToBe(
    `# Changelog

## [v1.0.0]

### Added
- Added a new feature

### Dependencies
- Bump \`other-package\` from v2 to v3
- Bump \`package\` from v1 to v2 (#123)

## [v0.9.0]

### Dependencies
- Bump \`package\` from alpha to v1`
  )
})

const CHANGELOG_WITH_EXISTING_SECTION_AND_SEPARATED_SECTIONS_WITH_NESTED_ENTRIES = `# Changelog

## [v1.0.0]

### Added
- Added a new feature
  - Added a new subfeature

### Dependencies
- Bump \`other-package\` from v2 to v3

## [v0.9.0]

### Dependencies
- Bump \`package\` from alpha to v1`

test('updates existing section when sections separated by blank lines contain nested entries', async () => {
  mockReadStream(
    CHANGELOG_WITH_EXISTING_SECTION_AND_SEPARATED_SECTIONS_WITH_NESTED_ENTRIES
  )

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')

  expectWrittenChangelogToBe(
    `# Changelog

## [v1.0.0]

### Added
- Added a new feature
  - Added a new subfeature

### Dependencies
- Bump \`other-package\` from v2 to v3
- Bump \`package\` from v1 to v2 (#123)

## [v0.9.0]

### Dependencies
- Bump \`package\` from alpha to v1`
  )
})

const CHANGELOG_WITHOUT_EXISTING_SECTION_AND_SEPARATED_SECTIONS = `# Changelog

## [v1.0.0]

### Added
- Added a new feature

### Removed
- Removed a feature

## [v0.9.0]

### Dependencies
- Bump \`package\` from alpha to v1`

test('adds section when sections separated by blank lines', async () => {
  mockReadStream(CHANGELOG_WITHOUT_EXISTING_SECTION_AND_SEPARATED_SECTIONS)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')

  expectWrittenChangelogToBe(
    `# Changelog

## [v1.0.0]

### Added
- Added a new feature

### Removed
- Removed a feature
### Dependencies
- Bump \`package\` from v1 to v2 (#123)

## [v0.9.0]

### Dependencies
- Bump \`package\` from alpha to v1`
  )
})

const CHANGELOG_WITHOUT_EXISTING_SECTION_AND_SEPARATED_SECTIONS_WITH_NESTED_ENTRIES = `# Changelog

## [v1.0.0]

### Added
- Added a new feature
  - Added a new subfeature

### Removed
- Removed a feature

## [v0.9.0]

### Dependencies
- Bump \`package\` from alpha to v1`

test('adds section when sections separated by blank lines contain nested entries', async () => {
  mockReadStream(
    CHANGELOG_WITHOUT_EXISTING_SECTION_AND_SEPARATED_SECTIONS_WITH_NESTED_ENTRIES
  )

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')

  expectWrittenChangelogToBe(
    `# Changelog

## [v1.0.0]

### Added
- Added a new feature
  - Added a new subfeature

### Removed
- Removed a feature
### Dependencies
- Bump \`package\` from v1 to v2 (#123)

## [v0.9.0]

### Dependencies
- Bump \`package\` from alpha to v1`
  )
})

const CHANGELOG_WITH_EXISTING_SECTION_BETWEEN_OTHERS = `# Changelog

## [v1.0.0]

### Added
- Added a new feature

### Dependencies
- Bump \`other-package\` from v2 to v3

### Removed
- Removed a feature

## [v0.9.0]

### Dependencies
- Bump \`package\` from alpha to v1`

test('updates existing section when between other sections', async () => {
  mockReadStream(CHANGELOG_WITH_EXISTING_SECTION_BETWEEN_OTHERS)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Bump')

  expectWrittenChangelogToBe(
    `# Changelog

## [v1.0.0]

### Added
- Added a new feature

### Dependencies
- Bump \`other-package\` from v2 to v3
- Bump \`package\` from v1 to v2 (#123)

### Removed
- Removed a feature

## [v0.9.0]

### Dependencies
- Bump \`package\` from alpha to v1`
  )
})

const CHANGELOG_WITH_PROPER_SECTIONS_AND_ENTRIES_DIFFERENT_PREFIX = `# Changelog

## [v1.0.0]
### Dependencies
- Bump \`different-package\` from v1 to v2`

test('adds an entry with a different prefix to the changelog when section already exists with entry', async () => {
  mockReadStream(CHANGELOG_WITH_PROPER_SECTIONS_AND_ENTRIES_DIFFERENT_PREFIX)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Update')

  expectWrittenChangelogToBe(`# Changelog

## [v1.0.0]
### Dependencies
- Bump \`different-package\` from v1 to v2
- Update \`package\` from v1 to v2 (#123)`)
})

const CHANGELOG_WITH_DUPLICATE_ENTRY_DIFFERENT_PREFIX = `# Changelog

## [v1.0.0]
### Dependencies
- Bump \`package\` from v1 to v2`

test('keeps prefix on entry with a different prefix but is otherwise a duplicate', async () => {
  mockReadStream(CHANGELOG_WITH_DUPLICATE_ENTRY_DIFFERENT_PREFIX)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Update')

  expectWrittenChangelogToBe(`# Changelog

## [v1.0.0]
### Dependencies
- Bump \`package\` from v1 to v2 (#123)`)
})

const CHANGELOG_WITH_EXISTING_ENTRY_DIFFERENT_PREFIX = `# Changelog

## [v1.0.0]
### Dependencies
- Bump \`package\` from v1 to v1.1`

test('keeps prefix on entry with a different prefix', async () => {
  mockReadStream(CHANGELOG_WITH_EXISTING_ENTRY_DIFFERENT_PREFIX)

  await updateChangelog(PACKAGE_ENTRY, 'v1.0.0', './CHANGELOG.md', 'Update')

  expectWrittenChangelogToBe(`# Changelog

## [v1.0.0]
### Dependencies
- Bump \`package\` from v1 to v2 (#123)`)
})

function mockReadStream(changelog: string) {
  fs.createReadStream.mockImplementation((_: PathLike) => {
    return Readable.from([changelog])
  })
}

function expectWrittenChangelogToBe(changelog: string, calls = 1) {
  expect(fs.writeFileSync).toBeCalledTimes(calls)
  const params = fs.writeFileSync.mock.calls[0]
  expect(params[0]).toStrictEqual('./CHANGELOG.md')
  expect(params[1]).toStrictEqual(changelog)
}
