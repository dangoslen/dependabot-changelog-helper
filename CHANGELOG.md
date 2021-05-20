# Changelog

## [1.0.0]
First official release of the Dependabot Changelog Helper! 🚀
### Dependencies
- Bumps `@types/jest` from 26.0.20 to 26.0.23
- Bumps `typescript` from 4.1.3 to 4.2.4

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