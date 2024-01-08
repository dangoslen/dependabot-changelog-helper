import fs from 'fs'
import {EOL} from 'os'
import {VersionEntry} from './entries/entry-extractor'

interface ParsedResult {
  foundDuplicateEntry: boolean
  foundEntryToUpdate: boolean
  lineToUpdate: number
  versionFound: boolean
  dependencySectionFound: boolean
}

const UNRELEASED_REGEX = new RegExp(
  /^## \[(unreleased|Unreleased|UNRELEASED)\]/
)
const EMPTY_LINE_REGEX = new RegExp(/^\s*$/)
const SECTION_ENTRY_REGEX = new RegExp(/^\s*- /)

export class ChangelogUpdater {
  private contents: string[]
  private changed: boolean

  constructor(
    private readonly version: string,
    private readonly changelogPath: fs.PathLike,
    private readonly entryPrefix: string,
    private readonly sectionHeader: string
  ) {
    this.contents = []
    this.changed = false
  }

  async readChangelog(): Promise<void> {
    this.contents = fs.readFileSync(this.changelogPath, 'utf-8').split(EOL)
  }

  async writeChangelog(): Promise<void> {
    // Write the contents out, joining with EOL
    if (this.changed) {
      fs.writeFileSync(this.changelogPath, this.contents.join(EOL))
    }
  }

  async updateChangelog(entry: VersionEntry): Promise<void> {
    const versionRegex = new RegExp(`^## \\[${this.version}\\]`)

    const regexs: RegExp[] = [versionRegex, UNRELEASED_REGEX]
    for (const regex of regexs) {
      const found = await this.searchAndUpdateVersion(regex, entry)

      // If we found the version, we have updated the changelog or we had a duplicate
      if (found) {
        return
      }
    }

    throw new Error(
      `Could not find version ${this.version} or the unreleased version`
    )
  }

  private async searchAndUpdateVersion(
    versionRegex: RegExp,
    entry: VersionEntry
  ): Promise<Boolean> {
    const result = await this.parseChangelogForEntry(versionRegex, entry)

    // We could not find the desired version to update by the configuration of the action
    if (!result.versionFound) {
      return false
    }

    if (result.foundEntryToUpdate) {
      this.updateEntry(entry, result)
    } else if (!result.foundDuplicateEntry) {
      this.addNewEntry(entry, result)
    }

    return true
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

  private addNewEntry(entry: VersionEntry, result: ParsedResult): void {
    // We build the entry string "backwards" so that we can only do one write, and base it on if the correct
    // sections exist
    let changelogEntry = this.buildEntryLine(entry)
    const lineNumber = result.lineToUpdate
    if (!result.dependencySectionFound) {
      changelogEntry = `### ${this.sectionHeader}${EOL}${changelogEntry}`

      // Check if the line number is last.
      // If not, add a blank line between the last section and the next version
      if (lineNumber < this.contents.length - 1) {
        changelogEntry = `${changelogEntry}${EOL}`
      }
    }

    this.writeEntry(lineNumber, changelogEntry)
  }

  private updateEntry(entry: VersionEntry, result: ParsedResult): void {
    const lineNumber = result.lineToUpdate
    const existingLine = this.contents[lineNumber]
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

    this.contents[lineNumber] = changelogEntry
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

  private writeEntry(lineNumber: number, changelogEntry: string): void {
    // Push a copy of the last line to the end of the contents and include the line-ending
    // It will be overwritten when we re-write all the contents
    const lastLine = this.contents[this.contents.length - 1]
    const length = this.contents.push(lastLine)

    // Copy the contents from the last line up until the line of the entry we want to write
    for (let i = length - 1; i > lineNumber; i--) {
      this.contents[i] = this.contents[i - 1]
    }

    // Write the entry
    this.contents[lineNumber] = changelogEntry
    this.changed = true
  }

  private async parseChangelogForEntry(
    versionRegex: RegExp,
    entry: VersionEntry
  ): Promise<ParsedResult> {
    const sectionRegex = new RegExp(
      `^### (${this.sectionHeader}|${this.sectionHeader.toUpperCase()})`
    )

    let lineNumber = 0
    let lineToUpdate = 0
    let versionFound = false
    let dependencySectionFound = false
    let foundLastEntry = false
    let foundDuplicateEntry = false
    let foundEntryToUpdate = false

    const entryLine = this.buildEntryLineForDuplicateCheck(entry)
    const entryLineStartRegex = this.buildEntryLineStartRegex(entry)

    // The module used to insert a line back to the CHANGELOG is 1-based offset instead of 0-based
    for (const line of this.contents) {
      if (
        foundLastEntry ||
        foundDuplicateEntry ||
        foundEntryToUpdate ||
        EMPTY_LINE_REGEX.test(line)
      ) {
        lineNumber++
        continue
      }

      if (versionFound) {
        // If we are finding a new version after having found the right version
        if (line.startsWith('## ')) {
          // Then we have found the last entry regardless of if we found the dependency section
          foundLastEntry = true

          // If we haven't found the dependency section, we need to set the line to update number
          if (!dependencySectionFound) {
            lineToUpdate = lineNumber
          }
        } else if (line.startsWith('### ')) {
          // If we are finding a new section and we have found the right version
          // and we have found the dependency section, we are moving into a new section
          // Otherwise, see if this is the dependency section
          if (dependencySectionFound) {
            foundLastEntry = true
          } else {
            dependencySectionFound = sectionRegex.test(line)
            lineToUpdate = lineNumber + 1
          }
        } else if (SECTION_ENTRY_REGEX.test(line)) {
          if (line.startsWith(entryLine)) {
            // If we are finding a duplicate line, we have found duplicate entry and we will skip
            foundDuplicateEntry = true
          } else if (entryLineStartRegex.test(line)) {
            // If we are finding the start to the entry, we have an entry to update and we will overwrite it
            foundEntryToUpdate = true
            lineToUpdate = lineNumber
          } else {
            // Assume we find the last line if we find an entry
            // We will append our new entry to end on the next line
            lineToUpdate = lineNumber + 1
          }
        }
      } else if (versionRegex.test(line)) {
        // If we have not found the version, see if this is the version
        versionFound = true
        lineToUpdate = lineNumber + 1
      }

      lineNumber++
    }

    // If the last line is empty, it is due to a trailing newline
    // Don't include it in the contents of the changelog
    if (EMPTY_LINE_REGEX.test(this.contents[this.contents.length - 1])) {
      lineNumber--
    }

    // If we are at the end of the file, and we never found the last entry of the dependencies,
    // it is because the last entry was the last line of the file
    lineToUpdate = this.lastLineCheck(
      lineToUpdate,
      lineNumber,
      foundLastEntry || foundDuplicateEntry || foundEntryToUpdate,
      versionFound
    )

    return {
      foundDuplicateEntry,
      foundEntryToUpdate,
      lineToUpdate,
      versionFound,
      dependencySectionFound
    }
  }

  private lastLineCheck(
    lineToUpdate: number,
    contentLength: number,
    foundLastEntry: boolean,
    versionFound: boolean
  ): number {
    if (!foundLastEntry && versionFound) {
      return contentLength
    }
    return lineToUpdate
  }
}
