import readline from 'readline'
import fs from 'fs'
import {EOL} from 'os'
import {DependabotEntry} from './entry-extractor'
import {PathLike} from 'fs'

interface ParsedResult {
  changelogLineNumber: number
  versionFound: boolean
  dependencySectionFound: boolean,
  contents: string[]
}

const DEPENDENCY_SECTION_REGEX = new RegExp(/^### [Dependencies|DEPENDENCIES]/)
const EMPTY_LINE_REGEX = new RegExp(/^[\s|\Z]$/)

export async function addDependabotEntry(
  entry: DependabotEntry,
  version: string,
  changelogPath: PathLike
) {
  const versionRegex: RegExp = buildVersionRegex(version)
  const result: ParsedResult = await parseChangelogForEntry(
    versionRegex,
    changelogPath
  )

  // We build the entry string "backwards" so that we can only do one write, and base it on if the correct
  // sections exist
  let changelogEntry = buildDependencyEntry(entry)
  if (!result.dependencySectionFound) {
    changelogEntry = `### Dependencies` + EOL + changelogEntry
  }
  if (!result.versionFound) {
    changelogEntry = `## [${version}]` + EOL + changelogEntry
  }
  writeLine(result.changelogLineNumber, changelogPath, changelogEntry, result.contents)
}

function writeLine(lineNumber: number, changelogPath: PathLike, changelogEntry : string, contents: string[]) {
  var length = contents.push('')
  for (var l = length - 1; l > lineNumber; l--) {
    contents[l] = contents[l - 1]
  }
  contents[lineNumber] = changelogEntry
  fs.writeFileSync(changelogPath, contents.join(EOL))
}

function buildVersionRegex(version: string) {
  return new RegExp(`^## \\[${version}\\]`)
}

function buildDependencyEntry(entry: DependabotEntry) {
  return `- Bumps \`${entry.package}\` from ${entry.oldVersion} to ${entry.newVersion}`
}


async function parseChangelogForEntry(
  versionRegex: RegExp,
  changelogPath: PathLike
) {
  const fileStream = readline.createInterface({
    input: fs.createReadStream(changelogPath),
    terminal: false
  })

  let lineNumber = 0
  let changelogLineNumber = 0
  let versionFound = false
  let dependencySectionFound = false
  let foundEntryLine

  var contents = []

  // The module used to insert a line back to the CHANGELOG is 1-based offset instead of 0-based
  for await (const line of fileStream) {
    contents.push(line)

    if (foundEntryLine) {
      continue
    }

    if (versionFound && DEPENDENCY_SECTION_REGEX.test(line)) {
      dependencySectionFound = true
      changelogLineNumber = lineNumber
    } 
    
    if (!versionFound && versionRegex.test(line)) {
      versionFound = true
      changelogLineNumber = lineNumber
    }

    foundEntryLine = dependencySectionFound && EMPTY_LINE_REGEX.test(line)
    if (foundEntryLine) {
      changelogLineNumber = lineNumber
    } else {
        lineNumber++
    }
  }

  // If we are at the end of the file, and we never found the last entry of the dependcies,
  // it is because the last entry was the last line of the file
  if (contents.length == lineNumber && !foundEntryLine && dependencySectionFound) {
    changelogLineNumber = lineNumber
  }

  return {
    changelogLineNumber: changelogLineNumber,
    versionFound: versionFound,
    dependencySectionFound: dependencySectionFound,
    contents: contents
  }
}
