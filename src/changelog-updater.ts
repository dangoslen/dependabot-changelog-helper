import readline from 'readline'
import fs from 'fs'
import {EOL} from 'os'
import {DependabotEntry} from './entry-extractor'

interface ParsedResult {
  foundDuplicateEntry: boolean
  changelogLineNumber: number
  versionFound: boolean
  dependencySectionFound: boolean
  contents: string[]
}

const DEPENDENCY_SECTION_REGEX = new RegExp(/^### [Dependencies|DEPENDENCIES]/)
const EMPTY_LINE_REGEX = new RegExp(/^\s*$/)

export async function updateChangelog(
  entry: DependabotEntry,
  version: string,
  newVersionLineNumber: number,
  changelogPath: fs.PathLike
): Promise<void> {
  const versionRegex: RegExp = buildVersionRegex(version)
  let changelogEntry = `- Bumps \`${entry.package}\` from ${entry.oldVersion} to ${entry.newVersion}`
  const result: ParsedResult = await parseChangelogForEntry(
    versionRegex,
    changelogEntry,
    changelogPath
  )

  // If the entry was already found, we don't write a change to the changelog
  if (result.foundDuplicateEntry) {
    return
  }

  // We build the entry string "backwards" so that we can only do one write, and base it on if the correct
  // sections exist
  let lineNumber = result.changelogLineNumber
  if (!result.dependencySectionFound) {
    changelogEntry = `### Dependencies${EOL}${changelogEntry}`
  }
  if (!result.versionFound) {
    changelogEntry = `## [${version}]${EOL}${changelogEntry}${EOL}`
    lineNumber = newVersionLineNumber
  }
  writeLine(lineNumber, changelogPath, changelogEntry, result.contents)
}

function writeLine(
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

function buildVersionRegex(version: string): RegExp {
  return new RegExp(`^## \\[${version}\\]`)
}

async function parseChangelogForEntry(
  versionRegex: RegExp,
  changelogEntry: string,
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

  const contents = []

  // The module used to insert a line back to the CHANGELOG is 1-based offset instead of 0-based
  for await (const line of fileStream) {
    contents.push(line)
    // Only check the line if we haven't found the entry before
    if (!foundDuplicateEntry && line.startsWith(changelogEntry)) {
      foundDuplicateEntry = true
    }

    // If we have found the last Dependencies entry for the version, just continue to the next line
    if (foundLastEntry) {
      continue
    }

    if (versionFound && DEPENDENCY_SECTION_REGEX.test(line)) {
      dependencySectionFound = true
      changelogLineNumber = lineNumber
    }

    if (!versionFound && versionRegex.test(line)) {
      versionFound = true
      changelogLineNumber = lineNumber + 1
    }

    foundLastEntry = dependencySectionFound && EMPTY_LINE_REGEX.test(line)
    if (foundLastEntry) {
      changelogLineNumber = lineNumber
    } else {
      lineNumber++
    }
  }

  // If we are at the end of the file, and we never found the last entry of the dependcies,
  // it is because the last entry was the last line of the file
  if (
    contents.length === lineNumber &&
    !foundLastEntry &&
    dependencySectionFound
  ) {
    changelogLineNumber = lineNumber
  }

  return {
    foundDuplicateEntry,
    changelogLineNumber,
    versionFound,
    dependencySectionFound,
    contents
  }
}
