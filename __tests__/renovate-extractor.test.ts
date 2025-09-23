import {WebhookPayload} from '@actions/github/lib/interfaces'
import {RenovateExtractor} from '../src/entries/renovate-extractor'
import {VersionEntry} from '../src/entries/entry-extractor'

describe('RenovateExtractor', () => {
  const extractor = new RenovateExtractor()

  it('should return empty array when PR body is empty', () => {
    const payload = {
      pull_request: {
        body: '',
        number: 123
      }
    } as WebhookPayload

    const entries = extractor.getEntries(payload)
    expect(entries).toHaveLength(0)
  })

  it('should extract single dependency update without context', () => {
    const payload = {
      pull_request: {
        body: `
# Some PR description
| Package | Changes |
| --- | --- |
| [react](link.com) | [17.0.0 -> 18.0.0](link.com) |
        `,
        number: 123
      }
    } as WebhookPayload

    const entries = extractor.getEntries(payload)
    expect(entries).toHaveLength(1)
    expect(entries[0]).toEqual(
      expect.objectContaining({
        package: 'react',
        oldVersion: '17.0.0',
        newVersion: '18.0.0'
      })
    )
  })

  it('should extract multiple dependency updates with context', () => {
    const payload = {
      pull_request: {
        body: `
# Some PR description
| Package | Changes |
| --- | --- | --- |
| [react](link.com)([context](link.com)) | [17.0.0 -> 18.0.0](link.com) |
| [typescript](link.com) | [20.0.0 -> 22.0.0](link.com) |
| [jest](link.com) | [27.0.0 -> 28.0.0](link.com) |
        `,
        number: 123
      }
    } as WebhookPayload

    const entries = extractor.getEntries(payload)
    expect(entries).toHaveLength(3)

    expect(entries[0]).toEqual(
      expect.objectContaining({
        package: 'react',
        newVersion: '18.0.0',
        oldVersion: '17.0.0'
      })
    )
    expect(entries[1]).toEqual(
      expect.objectContaining({
        package: 'typescript',
        newVersion: '22.0.0',
        oldVersion: '20.0.0'
      })
    )
    expect(entries[2]).toEqual(
      expect.objectContaining({
        package: 'jest',
        newVersion: '28.0.0',
        oldVersion: '27.0.0'
      })
    )
  })

  it('should handle if additional information is available in the package details', () => {
    const payload = {
      pull_request: {
        body: `
| Package | Changes |
| --- | --- | --- |
| [react](link.com)(context) | [17.0.0 -> 18.0.0](link.com) |
| [typescript](link.com)(context, context) | [20.0.0 -> 22.0.0](link.com) |
        `,
        number: 123
      }
    } as WebhookPayload

    const entries = extractor.getEntries(payload)
    expect(entries).toHaveLength(2)

    expect(entries[0]).toEqual(
      expect.objectContaining({
        package: 'react',
        newVersion: '18.0.0',
        oldVersion: '17.0.0'
      })
    )
    expect(entries[1]).toEqual(
      expect.objectContaining({
        package: 'typescript',
        newVersion: '22.0.0',
        oldVersion: '20.0.0'
      })
    )
  })

  it('should extract single container dependency update without context', () => {
    const payload = {
      pull_request: {
        body: `
# Some PR description
| Package | Type | Update | Change |
| --- | --- | --- | --- |
| [ghcr.io/renovatebot/renovate](https://renovatebot.com) | container | minor | \`41.100.0\` -> \`41.109.0\` |
        `,
        number: 123
      }
    } as WebhookPayload

    const entries = extractor.getEntries(payload)
    expect(entries).toHaveLength(1)
    expect(entries[0]).toEqual(
      expect.objectContaining({
        package: 'ghcr.io/renovatebot/renovate',
        oldVersion: '41.100.0',
        newVersion: '41.109.0'
      })
    )
  })

  it('should extract multiple container dependency update without context', () => {
    const payload = {
      pull_request: {
        body: `
# Some PR description
| Package | Type | Update | Change |
| --- | --- | --- | --- |
| [ghcr.io/renovatebot/renovate](https://renovatebot.com) | container | minor | \`41.100.0\` -> \`41.109.0\` |
| [foo](https://example.com) | container | major | \`1.0.0\` -> \`2.0.0\` |
        `,
        number: 123
      }
    } as WebhookPayload

    const entries = extractor.getEntries(payload)
    expect(entries).toHaveLength(2)
    expect(entries[0]).toEqual(
      expect.objectContaining({
        package: 'ghcr.io/renovatebot/renovate',
        oldVersion: '41.100.0',
        newVersion: '41.109.0'
      })
    )
    expect(entries[1]).toEqual(
      expect.objectContaining({
        package: 'foo',
        oldVersion: '1.0.0',
        newVersion: '2.0.0'
      })
    )
  })

  it('should extract single container dependency update with context', () => {
    const payload = {
      pull_request: {
        body: `
# Some PR description
| Package | Type | Update | Change |
| --- | --- | --- | --- |
| [ghcr.io/renovatebot/renovate](https://renovatebot.com) ([source](https://github.com/renovatebot/renovate)) | container | minor | \`41.100.0\` -> \`41.109.0\` |
        `,
        number: 123
      }
    } as WebhookPayload

    const entries = extractor.getEntries(payload)
    expect(entries).toHaveLength(1)
    expect(entries[0]).toEqual(
      expect.objectContaining({
        package: 'ghcr.io/renovatebot/renovate',
        oldVersion: '41.100.0',
        newVersion: '41.109.0'
      })
    )
  })

  it('should extract multiple container dependency update with context', () => {
    const payload = {
      pull_request: {
        body: `
# Some PR description
| Package | Type | Update | Change |
| --- | --- | --- | --- |
| [ghcr.io/renovatebot/renovate](https://renovatebot.com) ([context](example.com)) | container | minor | \`41.100.0\` -> \`41.109.0\` |
| [foo](https://example.com) ([context](example.com)) | container | major | \`1.0.0\` -> \`2.0.0\` |
        `,
        number: 123
      }
    } as WebhookPayload

    const entries = extractor.getEntries(payload)
    expect(entries).toHaveLength(2)
    expect(entries[0]).toEqual(
      expect.objectContaining({
        package: 'ghcr.io/renovatebot/renovate',
        oldVersion: '41.100.0',
        newVersion: '41.109.0'
      })
    )
    expect(entries[1]).toEqual(
      expect.objectContaining({
        package: 'foo',
        oldVersion: '1.0.0',
        newVersion: '2.0.0'
      })
    )
  })

  it('should extract plaintext package name', () => {
    const payload = {
      pull_request: {
        body: `
# Some PR description
| Package | Update | Change |
| --- | --- | --- |
| foo/bar | patch | \`v0.7.3\` -> \`v0.7.4\` |
        `,
        number: 123
      }
    } as WebhookPayload

    const entries = extractor.getEntries(payload)
    expect(entries).toHaveLength(1)
    expect(entries[0]).toEqual(
      expect.objectContaining({
        package: 'foo/bar',
        oldVersion: 'v0.7.3',
        newVersion: 'v0.7.4'
      })
    )
  })
})
