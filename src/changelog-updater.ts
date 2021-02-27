import readline from "readline"
import fs from "fs"
import { DependabotEntry } from "./entry-extractor";
import { PathLike } from "fs";

const insertLine = require('insert-line')

interface EntryResult {
    changelogLineNumber : number
    versionFound : boolean
    dependencySectionFound : boolean
}

const DEPENDENCY_SECTION_REGEX = new RegExp('/^### \[[Dependencies|DEPENDENCIES]\]\n/')

export function addDependabotEntry(entry : DependabotEntry, version : string, changelogPath : PathLike) {
    const result : EntryResult = findDependenciesLineForVersion(buildVersionRegex(version), changelogPath)

    let lineNumber = result.changelogLineNumber
    if (!result.versionFound) {
        addVersion(lineNumber, changelogPath, version)
        lineNumber++
    } else if(!result.dependencySectionFound) {
        addDependencieSection(lineNumber, changelogPath)
        lineNumber++
    }

    addEntry(lineNumber, changelogPath, entry)
}

function buildVersionRegex(version : string) {
    return new RegExp(`/^## \[${version}\]\n$/`)
}

function addVersion(lineNumber : number, changelogPath : PathLike, version : string) {
    const versionHeader = `## [${version}]\n`
    insertLine(changelogPath)
        .content(versionHeader, { prepend: true })
        .at(lineNumber)
}

function addDependencieSection(lineNumber : number, changelogPath : PathLike) {
    const versionHeader = `### Dependencies\n`
    insertLine(changelogPath)
        .content(versionHeader, { prepend: true })
        .at(lineNumber)
}

function addEntry(lineNumber : number, changelogPath : PathLike, entry : DependabotEntry) {
    const changelogEntry = `- Bumps \`${entry.package}\` from ${entry.oldVersion} to ${entry.newVersion}\n`
    insertLine(changelogPath)
        .content(changelogEntry, { prepend: true })
        .at(lineNumber)
}

function findDependenciesLineForVersion(versionRegex : RegExp, changelogPath : PathLike): EntryResult {
    const file = readline.createInterface({
        input: fs.createReadStream(changelogPath),
        output: process.stdout,
        terminal: false
    })

    let lineNumber = 0
    let changelogLineNumber = 0
    let versionFound = false
    let dependencySectionFound = false
    let foundEntryLine
    file.on('line', (line) => {
        foundEntryLine = dependencySectionFound && line.match(/^[\s]*\n$/)
        
        if (versionFound && DEPENDENCY_SECTION_REGEX.test(line)) {
            dependencySectionFound = true
            changelogLineNumber = lineNumber
        } else if (!versionFound && versionRegex.test(line)) {
            versionFound = true
            changelogLineNumber = lineNumber
        }

        if (!foundEntryLine) { 
            lineNumber++ 
        } else { 
            changelogLineNumber = lineNumber 
        }
    })

    return  {
        changelogLineNumber : changelogLineNumber,
        versionFound: versionFound,
        dependencySectionFound : dependencySectionFound
    }
}