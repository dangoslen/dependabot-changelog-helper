const TITLE_REGEX = new RegExp(/Bumps? ([\w|\-|_]*) from (.*) to (.*)/)

export interface DependabotEntry {
  package: string
  oldVersion: string
  newVersion: string
}

export function getDependabotEntry(title: string): DependabotEntry {
  const result = TITLE_REGEX.exec(title)
  if (result === null) {
    throw new Error('Unable to extract entry from pull request title!')
  }

  return {
    package: result[1],
    oldVersion: result[2],
    newVersion: result[3]
  }
}
