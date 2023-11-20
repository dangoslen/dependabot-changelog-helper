import {DependabotEntry, getDependabotEntries} from '../src/entry-extractor'

const PULL_REQUEST_EVENT = {
  repository: {
    full_name: 'owner/repo',
    name: 'repo',
    owner: {
      login: 'login',
      name: 'owner'
    }
  },
  pull_request: {
    number: 123,
    title: 'Bumps package from 6.0 to 7.0'
  }
}

const PULL_REQUEST_EVENT_ODD_PACKAGE_NIL_REPO = {
  pull_request: {
    number: 123,
    title: 'Bumps @package-with_odd_characters+ from 6.0 to 7.0'
  }
}

const PULL_REQUEST_EVENT_ALPHA_TO_BETA = {
  repository: {
    full_name: 'owner/repo',
    name: 'repo',
    owner: {
      login: 'login',
      name: 'owner'
    }
  },
  pull_request: {
    number: 123,
    title: 'Bumps package-with-dashes from 6.0-alpha to 6.0-beta'
  }
}

const PULL_REQUEST_EVENT_RUST_REQUIREMENT_UPDATE = {
  repository: {
    full_name: 'owner/repo',
    name: 'repo',
    owner: {
      login: 'login',
      name: 'owner'
    }
  },
  pull_request: {
    number: 123,
    title: 'Update clap requirement from ~2 to ~4'
  }
}

const PULL_REQUEST_LOWER_CASE_BUMP_WITH_PREFIX = {
  repository: {
    full_name: 'owner/repo',
    name: 'repo',
    owner: {
      login: 'login',
      name: 'owner'
    }
  },
  pull_request: {
    number: 123,
    title: 'a prefix: bump package from v2 to v4'
  }
}

const PULL_REQUEST_LOWER_CASE_UPDATE_WITH_DOCKER_PREFIX = {
  repository: {
    full_name: 'owner/repo',
    name: 'repo',
    owner: {
      login: 'login',
      name: 'owner'
    }
  },
  pull_request: {
    number: 123,
    title: '[docker]: update deps from v2 to v4'
  }
}

test('extracts package and simple number verions', async () => {
  const entries = getDependabotEntries(PULL_REQUEST_EVENT)

  const entry = entries[0]
  expect(entry.package).toStrictEqual('package')
  expect(entry.repository).toStrictEqual('owner/repo')
  expect(entry.oldVersion).toStrictEqual('6.0')
  expect(entry.newVersion).toStrictEqual('7.0')
})

test('extracts package and -alpha -beta versions', async () => {
  const entries = getDependabotEntries(PULL_REQUEST_EVENT_ALPHA_TO_BETA)

  const entry = entries[0]
  expect(entry.package).toStrictEqual('package-with-dashes')
  expect(entry.repository).toStrictEqual('owner/repo')
  expect(entry.oldVersion).toStrictEqual('6.0-alpha')
  expect(entry.newVersion).toStrictEqual('6.0-beta')
})

test('extracts package with odd package name', async () => {
  const entries = getDependabotEntries(PULL_REQUEST_EVENT_ODD_PACKAGE_NIL_REPO)

  const entry = entries[0]
  expect(entry.package).toStrictEqual('@package-with_odd_characters+')
  expect(entry.repository).toBeUndefined()
  expect(entry.oldVersion).toStrictEqual('6.0')
  expect(entry.newVersion).toStrictEqual('7.0')
})

test('extracts package with rust style requirement update', async () => {
  const entries = getDependabotEntries(
    PULL_REQUEST_EVENT_RUST_REQUIREMENT_UPDATE
  )

  const entry = entries[0]
  expect(entry.package).toStrictEqual('clap')
  expect(entry.repository).toStrictEqual('owner/repo')
  expect(entry.oldVersion).toStrictEqual('~2')
  expect(entry.newVersion).toStrictEqual('~4')
})

test('extracts package with prefix and lowercase bump', async () => {
  const entries = getDependabotEntries(PULL_REQUEST_LOWER_CASE_BUMP_WITH_PREFIX)

  const entry = entries[0]
  expect(entry.package).toStrictEqual('package')
  expect(entry.repository).toStrictEqual('owner/repo')
  expect(entry.oldVersion).toStrictEqual('v2')
  expect(entry.newVersion).toStrictEqual('v4')
})

test('extracts docker deps with prefix and lowercase update', async () => {
  const entries = getDependabotEntries(
    PULL_REQUEST_LOWER_CASE_UPDATE_WITH_DOCKER_PREFIX
  )

  const entry = entries[0]
  expect(entry.package).toStrictEqual('deps')
  expect(entry.repository).toStrictEqual('owner/repo')
  expect(entry.oldVersion).toStrictEqual('v2')
  expect(entry.newVersion).toStrictEqual('v4')
})
