import {DependabotEntry, getDependabotEntry} from '../src/entry-extractor'

test('throws invalid number', async () => {
  const entry: DependabotEntry = getDependabotEntry(
    'Bumps package from 6.0 to 7.0'
  )

  expect(entry.package).toStrictEqual('package')
  expect(entry.oldVersion).toStrictEqual('6.0')
  expect(entry.newVersion).toStrictEqual('7.0')
})
