# Contributor Guidelines

## Getting Started

We recommend using [Visual Studio Code](https://code.visualstudio.com/) as an editor, which will recommend some editor extensions on first load.

- `npm install` to install required dependencies
- `npm run build` to lint and build everything including docs
- `npm run lint` to lint source
- `npm version <newversion>` updates the version of this package
- `npm audit` to audit dependencies for vulnerabilities

## Configuration Details

Our codebase is written in [Typescript](https://www.typescriptlang.org/) and published as `js` with `.d.ts` files and `sourcemaps`.
We use [eslint](https://eslint.org/) and [prettier](https://prettier.io/) together for linting.
