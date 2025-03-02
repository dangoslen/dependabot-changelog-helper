import {parseLabels} from '../src/label-extractor'

test('parseLabels should return an empty array when given an empty string', () => {
  const labelsString = ''
  const result = parseLabels(labelsString)
  expect(result).toEqual([])
})

test('parseLabels should correctly parse a single label', () => {
  const labelsString = 'label1'
  const result = parseLabels(labelsString)
  expect(result).toEqual(['label1'])
})

test('parseLabels should correctly parse multiple labels separated by commas', () => {
  const labelsString = 'label1, label2, label3'
  const result = parseLabels(labelsString)
  expect(result).toEqual(['label1', 'label2', 'label3'])
})

test('parseLabels should correctly parse labels with special characters', () => {
  const labelsString =
    'label1, label-with-dashes, label+with+plus, label?with?question, label;with;semicolon, label[with]brackets, label(with)parenthesis, label/with/forward-slashes'
  const result = parseLabels(labelsString)
  expect(result).toEqual([
    'label1',
    'label-with-dashes',
    'label+with+plus',
    'label?with?question',
    'label;with;semicolon',
    'label[with]brackets',
    'label(with)parenthesis',
    'label/with/forward-slashes'
  ])
})

test('parseLabels should ignore leading and trailing whitespace', () => {
  const labelsString = '  label1  ,  label2  ,  label3  '
  const result = parseLabels(labelsString)
  expect(result).toEqual(['label1', 'label2', 'label3'])
})

test('parseLabels should ignore empty labels', () => {
  const labelsString = 'label1, , label2, , label3'
  const result = parseLabels(labelsString)
  expect(result).toEqual(['label1', 'label2', 'label3'])
})
