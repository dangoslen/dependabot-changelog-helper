export interface DependabotEntry {
  package: string
  oldVersion: string
  newVersion: string
}

const titleRegex = new RegExp(/Bumps? (\w*) from (\d.*) to (\d.*)/, 'g')

export function getDependabotEntry(title: string): DependabotEntry {
  const result = titleRegex.exec(title)
  if (result === null) {
    throw new Error('Unable to extract entry from pull request title!')
  }

  const entry: DependabotEntry = {
    package: result[1],
    oldVersion: result[2],
    newVersion: result[3]
  }

  return entry
}
