# Contributing

Thanks for your interest in contributing!
This is a very small and specific project - we would like to keep it that way.

If you have an idea for a new feature, please open an [issue](https://github.com/dangoslen/dependabot-changleog-helper/issues/new) first and discuss your idea for enhancement.

If you run into a problem, likewise open an [issue](https://github.com/dangoslen/dependabot-changleog-helper/issues/new) and we will address it as best as we see fit. 

## Development

Currently, this project uses TypeScript via `node`.
Dependencies are managed via `npm`.

### Installing

After cloning this repository, run:

```
npm install
```

### Building

```
npm run package
```

### Tests

```
npm test
```

This will run `npm lint` and lint code with [ESLint](https://eslint.org/).

### Changelog

Any notable changes to funtionality or updates to dependencies should be added into the [CHANGELOG](../CHANGELOG.md).
For an overview of what to write, take a look at the [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) guide.
