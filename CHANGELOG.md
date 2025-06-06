# CHANGELOG

Inspired from [Keep a Changelog](https://keepachangelog.com/en/1.0.0/)

## [UNRELEASED]

### Dependencies

- Bump `@types/node` from 22.14.0 to 22.15.2 ([#366](https://github.com/dangoslen/dependabot-changelog-helper/pull/366))
- Bump `dangoslen/dependabot-changelog-helper@releases/v4.0` from 4.0 to 4.1 ([#361](https://github.com/dangoslen/dependabot-changelog-helper/pull/361))
- Bump `dangoslen/dependabot-changelog-helper@releases/v4.0` from 4.0 to 4.1 ([#361](https://github.com/dangoslen/dependabot-changelog-helper/pull/361))

## [4.1.1]

Correctly packages the [4.1.0](https://github.com/dangoslen/dependabot-changelog-helper/releases/tag/v4.1.0) release for distribution. If you use the `4.1` tag, this will be automatically updated for actions using `dependabot-changelog-helper@4.1`

## [4.1.0]

This release was not properly package for distribution. If using the `4.1.0` version directly, upgrade to use the `4.1` tag or the `4.1.1` version directly to get the updates.

### Changed

- Now supports regex for the `version` input. See the [README](./README.md#version) for more details.

### Dependencies

- Bump `@types/node` from 22.13.5 to 22.14.0 ([#358](https://github.com/dangoslen/dependabot-changelog-helper/pull/358))
- Bump `typescript` from 5.7.3 to 5.8.3 ([#359](https://github.com/dangoslen/dependabot-changelog-helper/pull/359))

## [4.0.0]

### Added

- Now supports [Mend Renovate](https://www.mend.io/mend-renovate/)! Set the `dependencyTool` to `renovate` to use within your repositories. _:warning: in alpha!_

### Changed

- Refactors the internal updater to more easily account for multiple entries and formatting ([#311](https://github.com/dangoslen/dependabot-changelog-helper/issues/311))
- ci: replace comment_tag with comment-tag ([#311](https://github.com/dangoslen/dependabot-changelog-helper/issues/318))
- Adds proper newlines around version and section headers ([#310](https://github.com/dangoslen/dependabot-changelog-helper/issues/310)). This will only add newlines if **adding** a new version and section. When adding a new entry, the newlines will not be added.
- The `activationLabels` input is now based on the value of the `dependencyTool` by default. i.e., if you select `renovate` as the `dependencyTool` a `renovate` label will be searched for activation unless you supply a different value.
- Properly add a new version above the last one, if not in the changelog. Useful, if you have other content in your changelog header.

### Removed

- Removes the deprecated `activationLabel`. All workflows should specify desired labels using the `activationLabels` input instead. The default label of `dependabot` is still kept.

### Dependencies

- Bump `@types/node` from 20.12.12 to 22.13.5 ([#320](https://github.com/dangoslen/dependabot-changelog-helper/pull/320), [#331](https://github.com/dangoslen/dependabot-changelog-helper/pull/331), [#338](https://github.com/dangoslen/dependabot-changelog-helper/pull/338))
- Bump `ncipollo/release-action` from 1.14.0 to 1.15.0 ([#323](https://github.com/dangoslen/dependabot-changelog-helper/pull/323))
- Bump `ts-jest` from 29.2.5 to 29.2.6 ([#340](https://github.com/dangoslen/dependabot-changelog-helper/pull/340))
- Bump `typescript` from 5.7.2 to 5.7.3 ([#327](https://github.com/dangoslen/dependabot-changelog-helper/pull/327))

## [3.11.1]

### Fixed

- Corrects the regex introduced in [3.11.0](https://github.com/dangoslen/dependabot-changelog-helper/releases/tag/v3.11.0) to correct reading too many entries ([#278](https://github.com/dangoslen/dependabot-changelog-helper/issues/278))
- Corrects adding a newline after the first entry in multi-package updates ([#308](https://github.com/dangoslen/dependabot-changelog-helper/issues/308))

## [3.11.0]

### Fixed

- Fixes parsing too many possible entries when reading multi-package updates ([#278](https://github.com/dangoslen/dependabot-changelog-helper/issues/278)). 

### Changed

- Fix Github Actions Annotations ([#285](https://github.com/dangoslen/changelog-enforcer/pull/285))
- Improves example in `README.md` based on feedback in ([#278](https://github.com/dangoslen/dependabot-changelog-helper/issues/278))

### Dependencies

- Bump `@actions/core` from 1.10.1 to 1.11.1 ([#299](https://github.com/dangoslen/dependabot-changelog-helper/pull/299))
- Bump `@types/jest` from 29.5.12 to 29.5.14 ([#297](https://github.com/dangoslen/dependabot-changelog-helper/pull/297))
- Bump `eslint` from 8.45.0 to 8.57.0 ([#256](https://github.com/dangoslen/dependabot-changelog-helper/pull/256))
- Bump `ts-jest` from 29.1.2 to 29.2.5 ([#289](https://github.com/dangoslen/dependabot-changelog-helper/pull/289))

## [3.10.0]

### Changed

- Now runs on Node 20
  - Creates `.nvmrc` to set the version
  - Updates node version in `action.yml`

## [3.9.0]

### Added 

- Adds the ability to sort dependency entries alphabetically upon adding a new entry. By default this is _not_ enabled, and must be added via the `sort` param using the value `alpha`. By default the sort style is `none`. Future `sort` values _may_ be added over time as such needs arise.

### Dependencies

- Bump `@types/jest` from 29.5.11 to 29.5.12 ([#247](https://github.com/dangoslen/dependabot-changelog-helper/pull/247))
- Bump `@types/node` from 20.11.10 to 20.11.20 ([#251](https://github.com/dangoslen/dependabot-changelog-helper/pull/251), [#255](https://github.com/dangoslen/dependabot-changelog-helper/pull/255), [#257](https://github.com/dangoslen/dependabot-changelog-helper/pull/257))
- Bump `eslint-plugin-jest` from 27.6.3 to 27.9.0 ([#254](https://github.com/dangoslen/dependabot-changelog-helper/pull/254))

## [3.8.1]

### Fixed

- Fixes improper defaulting for deprecated `activationLabel` to `activationLabels` input

## [3.8.0]

### Added

- Adds scaffolding for `EntryExtractor` to support different tools (Dependabot, Mend Renovate, etc) in the future. See [#288](https://github.com/dangoslen/dependabot-changelog-helper/issues/228) for more details.
- Adds a new `activationLabels` input to allow for more complex workflows. See [#233](https://github.com/dangoslen/dependabot-changelog-helper/issues/233) for more details as to why.

### Deprecated

- The `activationLabel` input is now deprecated in favor of the `activationLabels` inpput (see the `Added` section above). The `activationLabel` input will be removed in the next major release, which currently has a TBD release date. 

### Dependencies

- Bump `eslint-plugin-jest` from 27.6.0 to 27.6.3 ([#236](https://github.com/dangoslen/dependabot-changelog-helper/pull/236))
- Bump `@types/node` from 20.4.2 to 20.11.10 ([#232](https://github.com/dangoslen/dependabot-changelog-helper/pull/232), [#235](https://github.com/dangoslen/dependabot-changelog-helper/pull/235), [#245](https://github.com/dangoslen/dependabot-changelog-helper/pull/245))
- Bump `@types/jest` from 29.5.10 to 29.5.11 ([#239](https://github.com/dangoslen/dependabot-changelog-helper/pull/239))
- Bump `ts-jest` from 29.1.1 to 29.1.2 ([#246](https://github.com/dangoslen/dependabot-changelog-helper/pull/246))

## [3.7.0]

### Added

- Now supports [Dependabot multi-package updates](https://docs.github.com/en/code-security/dependabot/dependabot-version-updates/configuration-options-for-the-dependabot.yml-file#groups). Each dependency upgrade will form a new line under the configured [section](./README.md#sectionheader) as if the upgrade was from it's own pull request.

### Dependencies

- Bump `@actions/github` from 5.1.0 to 6.0.0 ([#209](https://github.com/dangoslen/dependabot-changelog-helper/pull/209))
- Bump `jest` from 29.6.1 to 29.7.0 ([#211](https://github.com/dangoslen/dependabot-changelog-helper/pull/211))
- Bump `@types/jest` from 29.5.2 to 29.5.8 ([#211](https://github.com/dangoslen/dependabot-changelog-helper/pull/211))
- Bump `actions/checkout` from 3.5.3 to 4.1.1 ([#207](https://github.com/dangoslen/dependabot-changelog-helper/pull/207))
- Bump `actions/setup-node` from 3 to 4 ([#206](https://github.com/dangoslen/dependabot-changelog-helper/pull/206))
- Bump `@vercel/ncc` from 0.36.1 to 0.38.1 ([#221](https://github.com/dangoslen/dependabot-changelog-helper/pull/221))
- Bump `eslint-plugin-jest` from 27.2.2 to 27.6.0 ([#220](https://github.com/dangoslen/dependabot-changelog-helper/pull/220))

### Refactored

- Refactored how a changelog gets updated to allow for multiple entries to be written in one invocation of the action. This is preparatory work to allow for multi-package updates
- Refactored `entry-extractor` to return an array of `DependabotEntry` values to update the changelog with. This is preparatory work to allow for multi-package updates

## [3.6.0]

### Fixed

- Fixes reverting trailing newlines at end of the file [#199](https://github.com/dangoslen/dependabot-changelog-helper/issues/199)

### Added

- Adds a new `sectionHeader` option. See the [README](./README.md#sectionheader) for more details.

### Dependencies

- Bump `stefanzweifel/git-auto-commit-action` from 4 to 5 ([#198](https://github.com/dangoslen/dependabot-changelog-helper/pull/198))

## [3.5.0]

### Changed

- Pull Request links in the entry are now formatted as full Markdown links instead of relying on GitHub Auto-linking ([#189](https://github.com/dangoslen/dependabot-changelog-helper/pull/189))

### Dependencies

- Bump `jest` from 29.5.0 to 29.6.1 (#186)
- Bump `@types/node` from 20.4.1 to 20.4.2 (#190)
- Bump `eslint` from 8.44.0 to 8.45.0 (#191)

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

- Includes the number of the Dependabot pull request at the end of each entry line. Examples are in the dependency section below

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
