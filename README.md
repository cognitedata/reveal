<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

# Reveal 3D viewer and libraries #

[![Build Status](https://travis-ci.org/cognitedata/reveal.svg?branch=master)](https://travis-ci.org/cognitedata/reveal)

Reveal viewer a highly performant viewer for the Web written in a combination of TypeScript and Rust.

This repository contains the source code for the new version of the Cognite Reveal 3D viewer,
including its file loading libraries.

## Prerequisite ##
Install [Node](https://nodejs.org/en/download/)
Install [Rust](https://www.rust-lang.org/)

### Install wasm-pack

With Rust installed and ready to go, open a command shell: ```
cargo install wasm-pack

```
## Getting started ##

To test the viewer, you need to build the viewer first and then the examples:

```
cd viewer
npm install
npm run build
cd ..

cd examples
npm install
npm run serve
```

If you now navigate to [localhost:8080](https://localhost:8080), you will see a list of examples
that can be explored in the browser.
