export function parseLabels(labelsString: string): string[] {
  // Parses a list of labels. Each label can be of any length and will either end with a comma or be the end of the string.
  // Matches words (\w), whitespace characters (\s), dashes (-), plus signs (+), questions marks (\?), semi-colons (;), brackets (\[\]), parenthesis (\(\)) and forward-slashes (\/)
  // Each match may are may not have a trailing comma (,?). If one exists, it is removed before appending it to the list
  const regex = new RegExp(/([\w\s-\/+\?;\[\]\(\)]+,?)/, 'g')
  const labels = []
  let groups
  do {
    groups = regex.exec(labelsString)
    if (groups) {
      // Removes the trailing comma and removes all whitespace
      const label = groups[0].replace(',', '').trim()
      if (label !== '') {
        labels.push(label)
      }
    }
  } while (groups)
  return labels
}
