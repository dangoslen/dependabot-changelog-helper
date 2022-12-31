  <p align="center">
    <img src="https://github.com/dangoslen/dependabot-changelog-helper/actions/workflows/pull-request.yml/badge.svg" alt="build" />
    <img src="https://img.shields.io/github/v/release/dangoslen/dependabot-changelog-helper?color=orange&label=Latest" alt="latest version" />
    <img src="./coverage/badge.svg" alt="coverage badge" />
</p>

## Dependabot Changelog Helper

### We All Love Dependabot...
But sometimes it can feel overwhelming and require additional work to update things like versions and changelogs. 

**The purpose of this action is to help you easily manage some of those needs by auto-updating your changelog!**

Built around the [KeepAChangelog](https://keepachangelog.com/) format, this action will look for an entry line for an updated package and either

* Add it if not found (including adding the `### Dependencies` and `## [<version>]` sections!)
* Update it if the package has been upgraded after an initial entry was written

### Usage

#### Example Workflow

```yaml
name: 'pull-request'
on:
  pull_request:
    types:
      - opened
      - synchronize
      - reopened
      - ready_for_review
      - labeled
      - unlabeled

jobs:
  changelog:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          # Depending on your needs, you can use a token that will re-trigger workflows
          # See https://github.com/stefanzweifel/git-auto-commit-action#commits-of-this-action-do-not-trigger-new-workflow-runs
          token: ${{ secrets.GITHUB_TOKEN }} 
      - uses: dangoslen/dependabot-changelog-helper@v2
        with:
          version: ${{ needs.setup.outputs.version }}
          activationLabel: 'dependabot'
          changelogPath: './CHANGELOG.md'
```

### Inputs / Properties
Below are the properties allowed by the Dependabot Changelog Helper.

#### `version`
* Default: `UNRELEASED`
* The version to find in the changelog to add dependabot entries to.

If the `version` is not found, an unreleased version - matching the pattern `/^## [(unreleased|Unreleased|UNRELEASED)]` - is used. _Either the version you specify or an unreleased version must be present in your changelog or the action will fail._ Many changelogs default to keeping an released version at the top of the changelog as a way to incrementally build a version over time and only release a version once the right changes have been accounted for.

#### `changeLogPath`
* Default: `./CHANGELOG.md`
* The path to the changelog file to add dependabot entries to.

#### `activationLabel`
* Default: `dependabot`
* The label to indicate that the action should run
