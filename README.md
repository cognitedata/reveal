<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

# Reveal 3D viewer and libraries #

[![Build Status](https://travis-ci.org/cognitedata/reveal.svg?branch=master)](https://travis-ci.org/cognitedata/reveal)

Reveal viewer a highly performant viewer for the Web written in a combination of TypeScript and Rust.

This repository contains the source code for the new version of the Cognite Reveal 3D viewer,
including its file loading libraries.

## Prerequisites ##
Install [Node](https://nodejs.org/en/download/)
Install [Rust](https://www.rust-lang.org/)

### Install wasm-pack

##### Windows

With Rust installed and ready to go, open a command shell and run `cargo install wasm-pack`

##### Linux / macOS

You can either run the same command as in Windows, or install it faster through https://rustwasm.github.io/wasm-pack/

## Getting started ##

To test the viewer, you need to build the viewer and then the serve script will handle dependencies for examples:

```
cd viewer
npm install
npm run build
npm run serve
```

If you now navigate to [localhost:3000](https://localhost:3000), you will see a list of examples
that can be explored in the browser.

## Publishing Viewer (Dev only)

To publish a new version of a viewer follow these steps.
1) Create new release branch or check out existing release branch
> **Note**: A release branch is prefixed by `release/` and followed by the major and minor number, e.g. `release/0.8`.
2) Bump up the version in the `viewer/package.json` file
> **Note**: When bumping up major and minor version remember that you need to make a new release branch.
3) Change directory to the viewer folder, `cd viewer`
4) Run in terminal `npm run publishscript`

