import readline from 'readline'
import fs from 'fs'
import {EOL} from 'os'
import {DependabotEntry} from './entry-extractor'

interface ParsedResult {
  foundDuplicateEntry: boolean
  foundEntryToUpdate: boolean
  changelogLineNumber: number
  versionFound: boolean
  dependencySectionFound: boolean
  contents: string[]
}

const UNRELEASED_REGEX = new RegExp(
  /^## \[(unreleased|Unreleased|UNRELEASED)\]/
)
const DEPENDENCY_SECTION_REGEX = new RegExp(/^### (Dependencies|DEPENDENCIES)/)
const EMPTY_LINE_REGEX = new RegExp(/^\s*$/)

export async function updateChangelog(
  entry: DependabotEntry,
  version: string,
  changelogPath: fs.PathLike
): Promise<void> {
  const versionRegex: RegExp = buildVersionRegex(version)

  const regexs: RegExp[] = [versionRegex, UNRELEASED_REGEX]
  for (const regex of regexs) {
    const found = await searchAndUpdateVersion(regex, entry, changelogPath)

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
  changelogPath: fs.PathLike
): Promise<Boolean> {
  const result = await parseChangelogForEntry(
    versionRegex,
    entry,
    changelogPath
  )

  if (!result.versionFound) {
    return false
  }

  if (result.foundEntryToUpdate) {
    updateEntry(entry, changelogPath, result)
  }

  if (!result.foundDuplicateEntry) {
    addNewEntry(entry, changelogPath, result)
  }

  return true
}

function buildEntryLine(entry: DependabotEntry): string {
  return `${buildEntryLineStart(entry)} ${entry.oldVersion} to ${
    entry.newVersion
  }`
}

function buildEntryLineStart(entry: DependabotEntry): string {
  return `- Bumps \`${entry.package}\` from`
}

function addNewEntry(
  entry: DependabotEntry,
  changelogPath: fs.PathLike,
  result: ParsedResult
): void {
  // We build the entry string "backwards" so that we can only do one write, and base it on if the correct
  // sections exist
  let changelogEntry = buildEntryLine(entry)
  const lineNumber = result.changelogLineNumber
  if (!result.dependencySectionFound) {
    changelogEntry = `### Dependencies${EOL}${changelogEntry}`
  }
  writeEntry(lineNumber, changelogPath, changelogEntry, result.contents)
}

function updateEntry(
  entry: DependabotEntry,
  changelogPath: fs.PathLike,
  result: ParsedResult
): void {
  const lineNumber = result.changelogLineNumber
  const existingLine = result.contents[lineNumber]
  const existingPackage = existingLine.split(' to ')[0]
  const changelogEntry = `${existingPackage} to ${entry.newVersion}`
  overwriteEntry(lineNumber, changelogPath, changelogEntry, result.contents)
}

function writeEntry(
  lineNumber: number,
  changelogPath: fs.PathLike,
  changelogEntry: string,
  contents: string[]
): void {
  const length = contents.push('')
  for (let i = length - 1; i > lineNumber; i--) {
    contents[i] = contents[i - 1]
  }
  contents[lineNumber] = changelogEntry
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
  entry: DependabotEntry,
  changelogPath: fs.PathLike
): Promise<ParsedResult> {
  const fileStream = readline.createInterface({
    input: fs.createReadStream(changelogPath),
    terminal: false
  })

  let lineNumber = 0
  let changelogLineNumber = 0
  let versionFound = false
  let dependencySectionFound = false
  let foundLastEntry = false
  let foundDuplicateEntry = false
  let foundEntryToUpdate = false

  const entryLine = buildEntryLine(entry)
  const entryLineStart = buildEntryLineStart(entry)

  const contents = []

  // The module used to insert a line back to the CHANGELOG is 1-based offset instead of 0-based
  for await (const line of fileStream) {
    contents.push(line)

    if (foundLastEntry || foundDuplicateEntry || foundEntryToUpdate || EMPTY_LINE_REGEX.test(line)) {
      lineNumber++
      continue
    }

    if (versionFound) { // Inside version section
      if (line.startsWith("### ")) {
        if (dependencySectionFound) {
          foundLastEntry = true
        } else {
          dependencySectionFound = DEPENDENCY_SECTION_REGEX.test(line)
          changelogLineNumber = lineNumber + 1
        }
      } else if (line.startsWith("- ")) {
        if (line.startsWith(entryLine)) {
          foundDuplicateEntry = true
        } else if (line.startsWith(entryLineStart)) {
          foundEntryToUpdate = true
          changelogLineNumber = lineNumber
        } else {
          changelogLineNumber = lineNumber + 1
        }
      } else {
        foundLastEntry = true
      }
    } else if (versionRegex.test(line)) {
      versionFound = true
      changelogLineNumber = lineNumber + 1
    }

    lineNumber++
  }

  fileStream.close()

  // If we are at the end of the file, and we never found the last entry of the dependencies,
  // it is because the last entry was the last line of the file
  changelogLineNumber = lastLineCheck(
    changelogLineNumber,
    lineNumber,
    foundLastEntry || foundDuplicateEntry || foundEntryToUpdate,
    versionFound
  )

  return {
    foundDuplicateEntry,
    foundEntryToUpdate,
    changelogLineNumber,
    versionFound,
    dependencySectionFound,
    contents
  }
}

function lastLineCheck(
  changelogLineNumber: number,
  fileLength: number,
  foundLastEntry: boolean,
  versionFound: boolean
): number {
  if (!foundLastEntry && versionFound) {
    return fileLength
  }
  return changelogLineNumber
}
