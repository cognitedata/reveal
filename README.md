<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

# Reveal 3D viewer and libraries #

[![Build Status](https://travis-ci.org/cognitedata/reveal.svg?branch=master)](https://travis-ci.org/cognitedata/reveal)

Documentation for the latest version is available at [https://cognitedata.github.io/reveal/docs/](https://cognitedata.github.io/reveal/docs/)

We have [demos here](https://cognitedata.github.io/reveal/docs/examples/cad-basic)!

---

Reveal viewer is a highly performant 3d-viewer for the Web written in a combination of TypeScript and Rust.

This repository contains the source code for the new version of the Cognite Reveal 3D viewer,
including its file loading libraries.

All information below is for developers.

## Getting started

Install [Node](https://nodejs.org/en/download/)

To test the viewer, you need to build the viewer and then the serve script will handle dependencies for examples:

```
cd viewer
yarn install
yarn build
yarn serve
```

If you now navigate to [localhost:3000](https://localhost:3000), you will see a list of examples
that can be explored in the browser.

## Use local build with a project that uses reveal

1. Run viewer build

```bash
cd viewer
yarn run build
```

2. Use the build from `viewer/dist`. 
You can simply use it as a link dependency in the project that uses reveal if 
the target project uses yarn as its package manager.

  * Replace reveal version with the link on `viewer/dist` in the project `package.json`
```json
{
  "dependencies": {
    "@cognite/reveal": "link:<absolute or relative path to viewer/dist"
  }
}
```
  * After that, run `yarn` in the target project.
  * Don't forget you must not commit that change to the target project.
    
If you don't want to change package.json, you can use CLI utility [npm link](https://docs.npmjs.com/cli/link)
or [yarn link](https://classic.yarnpkg.com/en/docs/cli/link/). To do that:

1. Create a link

```bash
cd viewer/dist
npm link
``` 

2. Use the link in your target project

```bash
cd your-project-path
npm link @cognite/reveal
```

Now reveal should be replaced with the local build. 

When you don't need it linked in the target project anymore, run:

```bash
npm unlink @cognite/reveal
```

To unregister the link from your local environment:

```bash
cd viewer/dist
npm unlink
```

In case when you need to change and test the latest changes in parser-worker
consult [parser-worker/README.md](parser-worker/README.md)

## Publishing Viewer

To publish a new version of a viewer follow these steps.
1) Create new release branch or check out existing release branch
> **Note**: A release branch is prefixed by `release/` and followed by the major and minor number, e.g. `release/0.8`.
2) Bump up the version in the `viewer/package.json` file
> **Note**: When bumping up major and minor version remember that you need to make a new release branch.
3) Change directory to the viewer folder, `cd viewer`
4) Run in terminal `yarn publishscript`
