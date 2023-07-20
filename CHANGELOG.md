# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [UNRELEASED]
### Changed
- Pull Request links in the entry are now formatted as full Markdown links instead of relying on GitHub Auto-linking ([#189](https://github.com/dangoslen/dependabot-changelog-helper/pull/189))

### Dependencies
- Bump `jest` from 29.5.0 to 29.6.1 (#186)

## [3.4.0]
### Added
- Adds support for `bump` and `update` in Dependabot pull request titles (addresses #181)

### Dependencies
- Bump `@types/node` from 20.3.2 to 20.4.1 (#183)
- Bump `eslint` from 8.43.0 to 8.44.0 (#179)
- Bump `ts-jest` from 29.1.0 to 29.1.1 (#178)

## [3.3.0]
### Fixed
- Fixes support for sections with irregular entries or content.

### Dependencies
- Bump `actions/checkout` from 3.5.2 to 3.5.3 (#171)
- Bump `eslint` from 8.42.0 to 8.43.0 (#172)
- Bump `eslint-plugin-jest` from 27.2.1 to 27.2.2 (#173)
- Bump `@types/node` from 20.2.5 to 20.3.2 (#176)
- Bump `typescript` from 5.1.3 to 5.1.6 (#175)

## [3.2.0]
### Added
- Provides better [documentation for the entry format](./README.md#entry-format)

### Dependencies
- Bump `typescript` from 4.9.5 to 5.1.3 (#165)
- Bump `eslint-plugin-github` from 4.7.0 to 4.8.0 (#166)
- Bump `prettier` from 2.8.3 to 2.8.8 (#157)
- Bump `@types/node` from 18.16.4 to 20.2.5 (#167)
- Bump `eslint` from 8.39.0 to 8.42.0 (#168)
- Bump `@types/jest` from 29.5.1 to 29.5.2 (#164)

## [3.1.1]
### Fixed
- Support nested lists in changelogs #161 

## [3.1.0]
### Added
- Includes the number of the Dependabot pull request at the end of each entry line. Examples are in the depedency section below

### Dependencies
- Bump `actions/checkout` from 3.3.0 to 3.5.2 (#150)
- Bump `eslint-plugin-github` from 4.4.1 to 4.7.0 (#154)
- Bump `prettier` from 2.8.3 to 2.8.8 (#153)
- Bump `eslint` from 8.34.0 to 8.39.0 (#152)
- Bump `@types/node` from 18.14.1 to 18.16.3 (#151)
- Bumps `jest-circus` from 26.6.3 to 29.4.3 (#140)
- Bumps `jest` from 26.6.3 to 29.4.3 (#140)

## [3.0.0]
### Added
- Adds a new `entryPrefix` option. See the [README](./README.md#entryprefix) for more details.

### Changed
- Use imperative mood (`Bump` vs. `Bumps`) in changelog entry by default

### Dependencies
- Bumps `typescript` from 4.9.4 to 4.9.5
- Bumps `eslint` from 8.32.0 to 8.34.0
- Bumps `@types/node` from 18.11.18 to 18.14.1
- Bumps `@vercel/ncc` from 0.27.0 to 0.36.1 

## [2.2.1]
### Fixed
- Fixes an issue where a duplicate entry was added when a previous entry to update was found.

## [2.2.0]
### Added
- Adds support for Changelogs containing blank lines between sections

### Changed
- Small fixes for contributing guide

### Dependencies
- Bumps `typescript` from 4.9.3 to 4.9.4
- Bumps `actions/checkout` from 3.1.0 to 3.3.0
- Bumps `prettier` from 2.8.0 to 2.8.3
- Bumps `@types/node` from 14.18.33 to 18.11.18
- Bumps `eslint-plugin-jest` from 27.1.6 to 27.2.1
- Bumps `eslint` from 8.28.0 to 8.32.0

## [2.1.0]

### Added
- Adds support for Dependabot PRs that update Rust dependency requirements

### Dependencies
- Bumps `prettier` from 2.3.0 to 2.8.0
- Bumps `stefanzweifel/git-auto-commit-action` from 4.14.1 to 4.15.4
- Bumps `actions/checkout` from 3.0.2 to 3.1.0

## [2.0.0]

### Breaking Changes
- `newVersionLineNumber` is removed. Instead, if a version is not found, this action now looks for an unreleased version. If neither version can be found, the action will error. Read more in the [README.md](./README.md#version)

## [1.0.0]

### First official release of the Dependabot Changelog Helper! 🚀

### Dependencies
- Bumps `@types/jest` from 26.0.20 to 26.0.23
- Bumps `typescript` from 4.1.3 to 4.2.4
- Bumps `ts-jest` from 26.4.4 to 26.5.6
- Bumps `prettier` from 2.2.1 to 2.3.0
- Bumps `@actions/core` from 1.2.6 to 1.2.7

## [0.3.2]
### Fixed
- Fixes an issue where if a previous dependabot entry is found but wrote the update to the wrong line

## [0.3.1]
### Changed
- If a `### Dependencies` section is not found under the desired version entry, it is now appeneded to the end of all sections rather than being appened right after the version entry

## [0.3.0]
### Added
- Adds proper GitHub Action branding
### Changed
- Updates the [README.md](./README.md) for proper formatting
- Updates the default value for `activationLabel` from `dependencies` to `dependabot`

## [0.2.0]
### Added
- Addresses #22. Previously updated package entries in the same version will be updated if a newer update comes along
- Better [README.md](./README.md)
- Adds coverage reports
- Simplifies pull request workflow for checking the changelog

## [0.1.0]
### Added 
- Adds initial logic for updating a changelog based on the [KeepAChangelog](https://keepachangelog.com/en/1.0.0/) format
### Dependencies
- Bumps `eslint` from 7.17.0 to 7.21.0
- Bumps `@types/node` from 14.14.30 to 14.14.31
- Bumps `eslint-plugin-jest` from 24.1.3 to 24.1.5