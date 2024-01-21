import { pullRequestHasLabels } from '../src/label-checker'

test('pullRequestHasLabels returns true when all labels are present', () => {
  const payload = {
    pull_request: {
      number: 123,
      labels: [
        {name: 'label1'},
        {name: 'label2'},
        {name: 'label3'}
        ]
      }
  }
  const labels = ['label1', 'label2', 'label3']
  const result = pullRequestHasLabels(payload, labels)
  expect(result).toBe(true)
})

test('pullRequestHasLabels returns false when at least one label is missing', () => {
  const payload = {
    pull_request: {
      number: 123,
      labels: [
        {name: 'label1'},
        {name: 'label2'},
        ]
      }
  }
  const labels = ['label1', 'label2', 'label3']
  const result = pullRequestHasLabels(payload, labels)
  expect(result).toBe(false)
})