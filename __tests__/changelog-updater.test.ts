import { addDependabotEntry } from '../src/changelog-updater'
import { DependabotEntry } from '../src/entry-extractor'

const { Readable } = require("stream")
const fs = require('fs')

const CHANGELOG_WITH_PROPER_SECTIONS_AND_ENTRIES = 
`# Changelog

## [UNRELEASED]
### Dependencies
- Bumps \`different-package\` from v1 to v2`

const CHANGELOG_WITH_PROPER_SECTIONS = 
`# Changelog

## [UNRELEASED]
### Dependencies`

const CHANGELOG_MISSING_DEPENDECIES = 
`# Changelog

## [UNRELEASED]`

const CHANGELOG_WITH_MULTIPLE_VERSIONS = 
`# Changelog

## [UNRELEASED]
### Dependencies
- Bumps \`different-package\` from v1 to v2

## [v1.0.0]
### Dependencies
- Bumps \`foo\` from bar to foo-bar
`

const PACKAGE_ENTRY : DependabotEntry = {
    package: 'package',
    newVersion: 'v2',
    oldVersion: 'v1'
}

jest.mock('fs')

test("adds an entry to the changelog - section already exists with entry", async () => {
    const readable = Readable.from([CHANGELOG_WITH_PROPER_SECTIONS_AND_ENTRIES])
    fs.createReadStream.mockReturnValue(readable);
    fs.readFileSync.mockReturnValue(CHANGELOG_WITH_PROPER_SECTIONS_AND_ENTRIES)

    await addDependabotEntry(PACKAGE_ENTRY, "UNRELEASED", './CHANGELOG.md')

    // Should only be called once
    const params = fs.writeFileSync.mock.calls[0]

    expect(params[0]).toStrictEqual('./CHANGELOG.md')
    expect(params[1]).toStrictEqual(
`# Changelog

## [UNRELEASED]
### Dependencies
- Bumps \`different-package\` from v1 to v2
- Bumps \`package\` from v1 to v2`
    )
})

test("adds an entry to the changelog - section already exists, but no entry", async () => {
    const readable = Readable.from([CHANGELOG_WITH_PROPER_SECTIONS])
    fs.createReadStream.mockReturnValue(readable);
    fs.readFileSync.mockReturnValue(CHANGELOG_WITH_PROPER_SECTIONS)

    await addDependabotEntry(PACKAGE_ENTRY, "UNRELEASED", './CHANGELOG.md')

    // Should only be called once
    const params = fs.writeFileSync.mock.calls[0]

    expect(params[0]).toStrictEqual('./CHANGELOG.md')
    expect(params[1]).toStrictEqual(
`# Changelog

## [UNRELEASED]
### Dependencies
- Bumps \`package\` from v1 to v2`
    )
})

test("adds an entry to the changelog - section does not exist, but version does", async () => {
    const readable = Readable.from([CHANGELOG_MISSING_DEPENDECIES])
    fs.createReadStream.mockReturnValue(readable);
    fs.readFileSync.mockReturnValue(CHANGELOG_MISSING_DEPENDECIES)

    await addDependabotEntry(PACKAGE_ENTRY, "UNRELEASED", './CHANGELOG.md')

    // Should only be called once
    const params = fs.writeFileSync.mock.calls[0]

    expect(params[0]).toStrictEqual('./CHANGELOG.md')
    expect(params[1]).toStrictEqual(
`# Changelog

## [UNRELEASED]
### Dependencies
- Bumps \`package\` from v1 to v2`
    )
})

test("adds an entry to the changelog - multiple versions", async () => {
    const readable = Readable.from([CHANGELOG_WITH_MULTIPLE_VERSIONS])
    fs.createReadStream.mockReturnValue(readable);
    fs.readFileSync.mockReturnValue(CHANGELOG_WITH_MULTIPLE_VERSIONS)

    await addDependabotEntry(PACKAGE_ENTRY, "UNRELEASED", './CHANGELOG.md')

    // Should only be called once
    const params = fs.writeFileSync.mock.calls[0]

    expect(params[0]).toStrictEqual('./CHANGELOG.md')
    expect(params[1]).toStrictEqual(
`# Changelog

## [UNRELEASED]
### Dependencies
- Bumps \`different-package\` from v1 to v2
- Bumps \`package\` from v1 to v2

## [v1.0.0]
### Dependencies
- Bumps \`foo\` from bar to foo-bar`
    )
})