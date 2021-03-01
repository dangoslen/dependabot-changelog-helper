import {DependabotEntry, getDependabotEntry} from '../src/entry-extractor'

test('extracts package and simple number verions', async () => {
  const entry: DependabotEntry = getDependabotEntry(
    'Bumps package from 6.0 to 7.0'
  )

  expect(entry.package).toStrictEqual('package')
  expect(entry.oldVersion).toStrictEqual('6.0')
  expect(entry.newVersion).toStrictEqual('7.0')
})

test('extracts package and -alpha -beta versions', async () => {
  const entry: DependabotEntry = getDependabotEntry(
    'Bumps package-with-dashes from 6.0-alpha to 6.0-beta'
  )

  expect(entry.package).toStrictEqual('package-with-dashes')
  expect(entry.oldVersion).toStrictEqual('6.0-alpha')
  expect(entry.newVersion).toStrictEqual('6.0-beta')
})
