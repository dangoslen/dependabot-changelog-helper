import readline from 'readline'
import fs from 'fs'
import {EOL} from 'os'
import {DependabotEntry} from './entry-extractor'

interface ParsedResult {
  foundDuplicateEntry: boolean
  foundEntryToUpdate: boolean
  lineToUpdate: number
  versionFound: boolean
  dependencySectionFound: boolean
  contents: string[]
}

const UNRELEASED_REGEX = new RegExp(
  /^## \[(unreleased|Unreleased|UNRELEASED)\]/
)
const EMPTY_LINE_REGEX = new RegExp(/^\s*$/)
const SECTION_ENTRY_REGEX = new RegExp(/^\s*- /)

export async function updateChangelog(
  entry: DependabotEntry,
  version: string,
  changelogPath: fs.PathLike,
  entryPrefix: string,
  sectionHeader: string
): Promise<void> {
  const versionRegex: RegExp = buildVersionRegex(version)

  const regexs: RegExp[] = [versionRegex, UNRELEASED_REGEX]
  for (const regex of regexs) {
    const found = await searchAndUpdateVersion(
      regex,
      entry,
      changelogPath,
      entryPrefix,
      sectionHeader
    )

    // If we found the version, we have updated the changelog or we had a duplicate
    if (found) {
      return
    }
  }

  throw new Error(`Could not find version ${version} or the unreleased version`)
}

async function searchAndUpdateVersion(
  versionRegex: RegExp,
  entry: DependabotEntry,
  changelogPath: fs.PathLike,
  entryPrefix: string,
  sectionHeader: string
): Promise<Boolean> {
  const result = await parseChangelogForEntry(
    versionRegex,
    entryPrefix,
    entry,
    changelogPath,
    sectionHeader
  )

  // We could not find the desired version to update by the configuration of the action
  if (!result.versionFound) {
    return false
  }

  if (result.foundEntryToUpdate) {
    updateEntry(entry, changelogPath, result)
  } else if (!result.foundDuplicateEntry) {
    addNewEntry(entryPrefix, entry, changelogPath, result, sectionHeader)
  }

  return true
}

// We only want to check for duplicates based only on package and versions
// We omit PR context - (#pr) - because we can't know which PR merged the previous bump
function buildEntryLineForDuplicateCheck(
  entryPrefix: string,
  entry: DependabotEntry
): string {
  const lineStart = buildEntryLineStart(entryPrefix, entry)
  return `${lineStart} ${entry.oldVersion} to ${entry.newVersion}`
}

function buildEntryLine(entryPrefix: string, entry: DependabotEntry): string {
  const lineStart = buildEntryLineForDuplicateCheck(entryPrefix, entry)
  const currentPullRequest = buildPullRequestLink(entry)
  return `${lineStart} (${currentPullRequest})`
}

function buildEntryLineStart(
  entryPrefix: string,
  entry: DependabotEntry
): string {
  return `- ${entryPrefix} \`${entry.package}\` from`
}

function buildEntryLineStartRegex(entry: DependabotEntry): RegExp {
  return new RegExp(`- \\w+ \`${entry.package}\` from `)
}

function addNewEntry(
  prefix: string,
  entry: DependabotEntry,
  changelogPath: fs.PathLike,
  result: ParsedResult,
  sectionHeader: string
): void {
  // We build the entry string "backwards" so that we can only do one write, and base it on if the correct
  // sections exist
  let changelogEntry = buildEntryLine(prefix, entry)
  const lineNumber = result.lineToUpdate
  if (!result.dependencySectionFound) {
    changelogEntry = `### ${sectionHeader}${EOL}${changelogEntry}`

    // Check if the line number is last.
    // If not, add a blank line between the last section and the next version
    if (lineNumber < result.contents.length - 1) {
      changelogEntry = `${changelogEntry}${EOL}`
    }
  }

  writeEntry(lineNumber, changelogPath, changelogEntry, result.contents)
}

function updateEntry(
  entry: DependabotEntry,
  changelogPath: fs.PathLike,
  result: ParsedResult
): void {
  const lineNumber = result.lineToUpdate
  const existingLine = result.contents[lineNumber]
  const existingPackage = existingLine.split(' to ')[0]
  const existingPullRequests = extractAssociatedPullRequests(existingLine)
  const currentPullRequest = buildPullRequestLink(entry)

  // We want to avoid accidentally re-updating the changelog multiple times with the same PR number
  // If we see the current PR number is reflected in the context, we don't need to update
  if (existingPullRequests.includes(currentPullRequest)) {
    return
  }

  const pullRequests = [...existingPullRequests, currentPullRequest]
  const changelogEntry = `${existingPackage} to ${
    entry.newVersion
  } (${pullRequests.join(', ')})`
  overwriteEntry(lineNumber, changelogPath, changelogEntry, result.contents)
}

function extractAssociatedPullRequests(existingLine: string): string[] {
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

function buildPullRequestLink(entry: DependabotEntry): string {
  const number = entry.pullRequestNumber
  return entry.repository
    ? `[#${number}](https://github.com/${entry.repository}/pull/${number})`
    : `#${number}`
}

function writeEntry(
  lineNumber: number,
  changelogPath: fs.PathLike,
  changelogEntry: string,
  contents: string[]
): void {
  // Push a copy of the last line to the end of the contents and include the line-ending
  // It will be overwritten when we re-write all the contents
  const lastLine = contents[contents.length - 1]
  const length = contents.push(lastLine)

  // Copy the contents from the last line up until the line of the entry we want to write
  for (let i = length - 1; i > lineNumber; i--) {
    contents[i] = contents[i - 1]
  }

  // Write the entry
  contents[lineNumber] = changelogEntry

  // If the last line was empty, assume it is a trailing newline
  // Append an additional empty line to write the trailing newline
  if (lastLine === '') {
    contents.push('')
  }

  // Write the contents out, joining with EOL
  fs.writeFileSync(changelogPath, contents.join(EOL))
}

function overwriteEntry(
  lineNumber: number,
  changelogPath: fs.PathLike,
  changelogEntry: string,
  contents: string[]
): void {
  contents[lineNumber] = changelogEntry
  fs.writeFileSync(changelogPath, contents.join(EOL))
}

function buildVersionRegex(version: string): RegExp {
  return new RegExp(`^## \\[${version}\\]`)
}

async function parseChangelogForEntry(
  versionRegex: RegExp,
  entryPrefix: string,
  entry: DependabotEntry,
  changelogPath: fs.PathLike,
  sectionHeader: string
): Promise<ParsedResult> {
  const fileStream = readline.createInterface({
    input: fs.createReadStream(changelogPath),
    terminal: false
  })

  const DEPENDENCY_SECTION_REGEX = new RegExp(
    `^### (${sectionHeader}|${sectionHeader.toUpperCase()})`
  )

  let lineNumber = 0
  let lineToUpdate = 0
  let versionFound = false
  let dependencySectionFound = false
  let foundLastEntry = false
  let foundDuplicateEntry = false
  let foundEntryToUpdate = false

  const entryLine = buildEntryLineForDuplicateCheck(entryPrefix, entry)
  const entryLineStartRegex = buildEntryLineStartRegex(entry)

  const contents = []

  // The module used to insert a line back to the CHANGELOG is 1-based offset instead of 0-based
  for await (const line of fileStream) {
    contents.push(line)

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
          dependencySectionFound = DEPENDENCY_SECTION_REGEX.test(line)
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

  fileStream.close()

  // If we are at the end of the file, and we never found the last entry of the dependencies,
  // it is because the last entry was the last line of the file
  lineToUpdate = lastLineCheck(
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
    dependencySectionFound,
    contents
  }
}

function lastLineCheck(
  lineToUpdate: number,
  fileLength: number,
  foundLastEntry: boolean,
  versionFound: boolean
): number {
  if (!foundLastEntry && versionFound) {
    return fileLength
  }
  return lineToUpdate
}
