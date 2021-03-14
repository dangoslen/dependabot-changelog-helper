  <p align="center">
    <img src="https://github.com/dangoslen/dependabot-changelog-helper/actions/workflows/pull-request.yml/badge.svg" alt="build" />
    <img src="https://img.shields.io/github/v/release/dangoslen/dependabot-changelog-helper?color=orange&label=Latest" alt="latest version" />
    <img src="./coverage/badge.svg" alt="coverage badge" />
</p>

## Dependabot Changelog Helper

### We All Love Dependabot...
But sometimes it can feel overwhelming and require additional work to update things like versions and changelogs. 

**The purpose of this action is to help you easily manage some of those needs by auto-updating your changelog!**

Built around the [Keep-a-changleog]() format, this action will look for an entry line for an updated package and either

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
    needs: [ setup ]
    steps:
      - uses: actions/checkout@v2
        with:
          # Depending on your needs, you can use a token that will re-trigger workflows
          # See https://github.com/stefanzweifel/git-auto-commit-action#commits-of-this-action-do-not-trigger-new-workflow-runs
          token: ${{ secrets.GITHUB_TOKEN }} 
      - uses: ./
        with:
          version: ${{ needs.setup.outputs.version }}
          newVersionLineNumber: 3
          activationLabel: 'dependabot-helper'
          changelogPath: './CHANGELOG.md'
      - uses: stefanzweifel/git-auto-commit-action@v4
        with:
          commit_message: "Updated Changelog"

      - id: changelog-enforcer
        uses: dangoslen/changelog-enforcer@v2
```

### Inputs / Properties
Below are the properties allowed by the Dependabot Changelog Helper.

#### `version`
* Default: `UNRELEASED`
* The version to find in the CHANGELOG to add dependabot entries to.

#### `changeLogPath`
* Default: `./CHANGELOG.md`
* The path to the CHANGELOG file to add dependabot entries to.

#### `activationLabel`
* Default: `dependencies`
* The label to indicate that the action should run

### `newVersionLineNumber`
* Default: 3
* If the desired version is not found in the file, this is the default line number (1-indexed) in which to place the new version
