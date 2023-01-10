import {DependabotEntry, getDependabotEntry} from '../src/entry-extractor'

const PULL_REQUEST_EVENT = {
  pull_request: {
    number: 123,
    title: 'Bumps package from 6.0 to 7.0'
  }
}

const PULL_REQUEST_EVENT_ODD_PACKAGE = {
  pull_request: {
    number: 123,
    title: 'Bumps @package-with_odd_characters+ from 6.0 to 7.0'
  }
}

const PULL_REQUEST_EVENT_ALPHA_TO_BETA = {
  pull_request: {
    number: 123,
    title: 'Bumps package-with-dashes from 6.0-alpha to 6.0-beta'
  }
}

const PULL_REQUEST_EVENT_RUST_REQUIREMENT_UPDATE = {
  pull_request: {
    number: 123,
    title: 'Update clap requirement from ~2 to ~4'
  }
}

test('extracts package and simple number verions', async () => {
  const entry: DependabotEntry = getDependabotEntry(PULL_REQUEST_EVENT)

  expect(entry.package).toStrictEqual('package')
  expect(entry.oldVersion).toStrictEqual('6.0')
  expect(entry.newVersion).toStrictEqual('7.0')
})

test('extracts package and -alpha -beta versions', async () => {
  const entry: DependabotEntry = getDependabotEntry(
    PULL_REQUEST_EVENT_ALPHA_TO_BETA
  )

  expect(entry.package).toStrictEqual('package-with-dashes')
  expect(entry.oldVersion).toStrictEqual('6.0-alpha')
  expect(entry.newVersion).toStrictEqual('6.0-beta')
})

test('extracts package with odd package name', async () => {
  const entry: DependabotEntry = getDependabotEntry(
    PULL_REQUEST_EVENT_ODD_PACKAGE
  )

  expect(entry.package).toStrictEqual('@package-with_odd_characters+')
  expect(entry.oldVersion).toStrictEqual('6.0')
  expect(entry.newVersion).toStrictEqual('7.0')
})

test('extracts package with rust style requirement update', async () => {
  const entry: DependabotEntry = getDependabotEntry(
    PULL_REQUEST_EVENT_RUST_REQUIREMENT_UPDATE
  )

  expect(entry.package).toStrictEqual('clap')
  expect(entry.oldVersion).toStrictEqual('~2')
  expect(entry.newVersion).toStrictEqual('~4')
})
