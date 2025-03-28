import fs from 'fs'
import {EOL} from 'os'
import {VersionEntry} from './entries/entry-extractor'

interface Entry {
  line: string
}

interface ParsedResult {
  length: number
  sectionStartLineNumber: number
  versionFound: boolean
  sectionFound: boolean
  dependencyEntries: Entry[]
}

export interface ChangelogUpdater {
  readChangelog(): Promise<void>
  addEntries(entries: VersionEntry[]): Promise<void>
  writeChangelog(): Promise<void>
}

const UNRELEASED_REGEX = new RegExp(
  /^## \[(unreleased|Unreleased|UNRELEASED)\]/
)
const EMPTY_LINE_REGEX = new RegExp(/^\s*$/)
const DEPENDENCY_ENTRY_REGEX = new RegExp(/^\s*- /)

export function newUpdater(
  version: string,
  changelogPath: fs.PathLike,
  entryPrefix: string,
  sectionHeader: string,
  sort: string
): ChangelogUpdater {
  // Convert version to regex if it's wrapped in forward slashes
  const versionPattern = createVersionRegex(version)

  return new DefaultChangelogUpdater(
    versionPattern,
    changelogPath,
    entryPrefix,
    sectionHeader,
    sort
  )
}

function createVersionRegex(version: string | RegExp): RegExp {
  if (typeof version === 'string') {
    return version.match(/^\/(.+)\/$/)
      ? new RegExp(version.slice(1, -1))
      : new RegExp(`^## \\[${version}\\]`)
  }

  return version
}

export class DefaultChangelogUpdater implements ChangelogUpdater {
  private contents: string[]
  private entries: Entry[]
  private versionFound: boolean
  private sectionFound: boolean
  private sectionStartLineNumber: number
  private changed: boolean
  private version: RegExp

  constructor(
    version: RegExp | string,
    private readonly changelogPath: fs.PathLike,
    private readonly entryPrefix: string,
    private readonly sectionHeader: string,
    private readonly sort: string
  ) {
    this.contents = []
    this.changed = false
    this.sectionFound = false
    this.versionFound = false
    this.sectionStartLineNumber = 0
    this.entries = []
    this.version = createVersionRegex(version)
  }

  async readChangelog(): Promise<void> {
    this.contents = fs.readFileSync(this.changelogPath, 'utf-8').split(EOL)

    const regexs: RegExp[] = [this.version, UNRELEASED_REGEX]

    for (const regex of regexs) {
      const result = await this.extractEntries(regex)

      // Break at the first version found
      if (result.versionFound) {
        this.versionFound = true
        this.sectionFound = result.sectionFound
        this.sectionStartLineNumber = result.sectionStartLineNumber
        this.entries = result.dependencyEntries
        break
      }
    }

    if (!this.versionFound) {
      this.sectionStartLineNumber =
        this.getLastReleasedVersionSectionStartLineNumber()
    }
  }

  async writeChangelog(): Promise<void> {
    await this.writeEntries()

    // Write the contents out, joining with EOL
    if (this.changed) {
      fs.writeFileSync(this.changelogPath, this.contents.join(EOL))
    }
  }

  private async writeEntries(): Promise<void> {
    // Sort all of the dependencies
    if (this.sort.toLowerCase() === 'alpha') {
      this.entries.sort((a, b) => a.line.localeCompare(b.line))
    }

    for (let idx = 0; idx < this.entries.length; idx++) {
      const entry = this.entries[idx]
      let line = entry.line
      // If the section was not found, we are at the beginning of a new version
      // So add an extra EOL after the entry line since it will be the only
      if (idx === 0 && !this.sectionFound) {
        line = `### ${this.sectionHeader}${EOL}${EOL}${line}`
        if (!this.versionFound) {
          const versionText = this.version.source
            .replace(/^\^## \\\[/, '')
            .replace(/\\\]$/, '')
          line = `## [${versionText}]${EOL}${EOL}${line}`
        }
      }

      const offset = this.sectionStartLineNumber + idx
      // If we are adding a section and we are adding the section before another version,
      // add an extra EOL after the entry
      if (
        offset < this.contents.length - 1 &&
        !this.sectionFound &&
        this.contents[offset + 1].startsWith('## ')
      ) {
        line = `${line}${EOL}`
      }

      // If we are adding a section or version and the previous line is not empty,
      // add an extra EOL before the entry
      if (
        offset > 0 &&
        idx === 0 &&
        this.contents[offset - 1] !== '' &&
        (!this.versionFound || !this.sectionFound)
      ) {
        line = `${EOL}${line}`
      }

      this.contents[offset] = line
    }
  }

  async addEntries(entries: VersionEntry[]): Promise<void> {
    // If we are adding the section at the beginning of the changelog,
    // add an empty line before the section
    if (this.sectionStartLineNumber === 0) {
      this.sectionStartLineNumber = 1
      if (this.contents.length <= 1) {
        this.contents.push('')
      }
    }

    for (const entry of entries) {
      this.searchAndUpdateVersion(entry)
    }
  }

  private searchAndUpdateVersion(entry: VersionEntry): void {
    for (let idx = 0; idx < this.entries.length; idx++) {
      const existing = this.entries[idx]
      const regex = this.buildEntryLineStartRegex(entry)
      if (regex.test(existing.line)) {
        const foundDuplicateEntry = this.buildEntryLineForDuplicateCheck(entry)
        if (foundDuplicateEntry === existing.line) {
          return
        }

        this.updateEntry(entry, idx)
        return
      }
    }
    this.addNewEntry(entry)
  }

  // We only want to check for duplicates based only on package and versions
  // We omit PR context - (#pr) - because we can't know which PR merged the previous bump
  private buildEntryLineForDuplicateCheck(entry: VersionEntry): string {
    const lineStart = this.buildEntryLineStart(entry)
    return `${lineStart} ${entry.oldVersion} to ${entry.newVersion}`
  }

  private buildEntryLineStart(entry: VersionEntry): string {
    return `- ${this.entryPrefix} \`${entry.package}\` from`
  }

  private buildEntryLine(entry: VersionEntry): string {
    const lineStart = this.buildEntryLineForDuplicateCheck(entry)
    const currentPullRequest = this.buildPullRequestLink(entry)
    return `${lineStart} (${currentPullRequest})`
  }

  private buildEntryLineStartRegex(entry: VersionEntry): RegExp {
    return new RegExp(`- \\w+ \`${entry.package}\` from `)
  }

  private addNewEntry(entry: VersionEntry): void {
    this.writeLine(this.sectionStartLineNumber, '')
    this.entries.push({line: this.buildEntryLine(entry)})
    this.changed = true
  }

  private updateEntry(entry: VersionEntry, idx: number): void {
    const existingLine = this.entries[idx].line
    const existingPackage = existingLine.split(' to ')[0]
    const existingPullRequests =
      this.extractAssociatedPullRequests(existingLine)
    const currentPullRequest = this.buildPullRequestLink(entry)

    // We want to avoid accidentally re-updating the changelog multiple times with the same PR number
    // If we see the current PR number is reflected in the context, we don't need to update
    if (existingPullRequests.includes(currentPullRequest)) {
      return
    }

    const pullRequests = [...existingPullRequests, currentPullRequest]
    const changelogEntry = `${existingPackage} to ${
      entry.newVersion
    } (${pullRequests.join(', ')})`

    this.entries[idx].line = changelogEntry
    this.changed = true
  }

  private extractAssociatedPullRequests(existingLine: string): string[] {
    // Find the start of the PR list
    const groups = existingLine.split(' (')
    if (groups.length < 2) {
      return []
    }

    // Remove the final `)` from the PR list
    const prs = groups[1].slice(0, -1)

    // Split by `,` - works for both full links and auto-link values
    return prs.split(',').map(s => s.trim())
  }

  private buildPullRequestLink(entry: VersionEntry): string {
    const number = entry.pullRequestNumber
    return entry.repository
      ? `[#${number}](https://github.com/${entry.repository}/pull/${number})`
      : `#${number}`
  }

  private writeLine(lineNumber: number, line: string): void {
    // Push a copy of the last line to the end of the contents and include the line-ending
    // It will be overwritten when we re-write all the contents
    const lastLine = this.contents[this.contents.length - 1]
    const length = this.contents.push(lastLine)

    // Copy the contents from the last line up until the line of the entry we want to write
    for (let i = length - 1; i > lineNumber; i--) {
      this.contents[i] = this.contents[i - 1]
    }

    // Write the entry
    this.contents[lineNumber] = line
    this.changed = true
  }

  private async extractEntries(versionRegex: RegExp): Promise<ParsedResult> {
    const regex = typeof versionRegex === 'string'
      ? new RegExp(`^## \\[${versionRegex}\\]`)
      : versionRegex

    const sectionRegex = new RegExp(
      `^### (${this.sectionHeader}|${this.sectionHeader.toUpperCase()})`
    )

    let lineNumber = 0
    let sectionStartLineNumber = 0
    let versionFound = false
    let sectionFound = false
    let sectionComplete = false
    let versionComplete = false

    const dependencyEntries: Entry[] = []

    // The module used to insert a line back to the CHANGELOG is 1-based offset instead of 0-based
    for (const line of this.contents) {
      if (versionComplete || EMPTY_LINE_REGEX.test(line)) {
        lineNumber++
        continue
      }

      if (versionFound && !versionComplete) {
        // If we are finding a new version after having found the right version
        if (line.startsWith('## ')) {
          // Then we have found the last entry regardless if we found the dependency section
          versionComplete = true

          // If we haven't found the dependency section, we need to add it here before the next section
          if (!sectionFound) {
            sectionStartLineNumber = lineNumber
          }
        } else if (line.startsWith('### ')) {
          // If we are finding a new section and we have found the right version
          // and we have found the dependency section, we are moving into a new section
          // Otherwise, see if this is the dependency section
          if (!sectionFound) {
            sectionFound = sectionRegex.test(line)
            sectionStartLineNumber = lineNumber + 1
          } else {
            sectionComplete = true
          }
        } else if (
          sectionFound &&
          !sectionComplete &&
          DEPENDENCY_ENTRY_REGEX.test(line)
        ) {
          // Push the entry into our list of existing entries
          dependencyEntries.push({line})
        }
      } else if (regex.test(line)) {
        // If we have not found the version, see if this is the version
        versionFound = true
      }

      lineNumber++
    }

    // If the last line is empty, it is due to a trailing newline
    // Don't include it in the contents of the changelog
    if (EMPTY_LINE_REGEX.test(this.contents[this.contents.length - 1])) {
      lineNumber--
    }

    if (!versionComplete && !sectionFound) {
      sectionStartLineNumber = lineNumber
    }

    return {
      length: lineNumber,
      sectionStartLineNumber,
      versionFound,
      sectionFound,
      dependencyEntries
    }
  }

  private getLastReleasedVersionSectionStartLineNumber(): number {
    let lineNumber = 0
    const releasedVersionRegex = new RegExp(`^## \\[v?\\d+`)

    for (const line of this.contents) {
      if (releasedVersionRegex.test(line)) {
        return lineNumber
      }
      lineNumber++
    }

    return 0
  }
}
