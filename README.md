  <p align="center">
    <img src="https://github.com/dangoslen/dependabot-changelog-helper/actions/workflows/pull-request.yml/badge.svg" alt="build" />
    <img src="https://img.shields.io/github/v/release/dangoslen/dependabot-changelog-helper?color=orange&label=Latest" alt="latest version" />
    <img src="./coverage/badge.svg" alt="coverage badge" />
</p>

## Dependabot Changelog Helper

This action helps you easily auto-update your changelog!

### We all love Dependabot...

But it can feel overwhelming and require additional work to update things like versions and changelogs.

Built around the [Keep-a-Changelog](https://keepachangelog.com/) format, this action looks for an entry line for an updated package and either:

- Add it if not found (including adding the `### Dependencies` and `## [<version>]` sections!)
- Update it if the package has been upgraded after an initial entry was written

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

Below are the properties you can use for the Dependabot Changelog Helper.

#### `version`

| Default      | Description                                                        |
| ------------ | ------------------------------------------------------------------ |
| `UNRELEASED` | The version to find in the changelog to add Dependabot entries to. |

If the `version` is not found then an unreleased version - matching the pattern `/^## [(unreleased|Unreleased|UNRELEASED)]` - is used.

Many changelogs default to keeping an released version at the top of the changelog.
This is a way to incrementally build a version over time and only release a version once the right changes have been accounted for.

> **Warning**
> For the action to work you must have either set a `version` _or_ have an unreleased version in your changelog.

#### `changeLogPath`

| Default          | Description                                                  |
| ---------------- | ------------------------------------------------------------ |
| `./CHANGELOG.md` | The path to the changelog file to add Dependabot entries to. |

#### `activationLabel`

| Default      | Description                                       |
| ------------ | ------------------------------------------------- |
| `dependabot` | The label to indicate that the action should run. |
