<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

# Reveal 3D viewer and libraries

[![Build Status](https://github.com/cognitedata/reveal/actions/workflows/ci.yml/badge.svg
)](https://github.com/cognitedata/reveal/actions/workflows/ci.yml)

Documentation with interactive examples for the latest version is available at [https://cognitedata.github.io/reveal/docs/](https://cognitedata.github.io/reveal/docs/)

---

Reveal viewer is a highly performant 3d-viewer for the Web written in a combination of TypeScript and Rust.

This repository contains the source code for the new version of the Cognite Reveal 3D viewer,
including its file loading libraries.

All information below is for developers.

## Getting started

Install [Node](https://nodejs.org/en/download/) and [Rust](https://doc.rust-lang.org/cargo/getting-started/installation.html).

To test the viewer, you need to build the viewer and then start the examples. 

```
cd viewer
yarn && yarn run build
cd ../examples
yarn && yarn run start
```

If you now navigate to [localhost:8080](https://localhost:8080), you will see a list of examples
that can be explored in the browser.

### Building on Macbook M1

Building Reveal on Macbook M1 migth require some special care.

If you experience issues during the `yarn`-stage in `viewer/`, e.g.
```
   no template named 'remove_cv_t' in namespace 'std'
```
try forcing GCC to build for C++14:

`env CXXFLAGS=-std=c++14 yarn`

There also could be an issue with puppeteer in `examples/` that is caused by it not finding a correct version of chromium for arm64. To solve it you should follow additional steps:

1. Install chromium from Homebrew: 
```
brew install chromium
`which chromium`
```

2. Inside `examples/` add two environment variables to your `~/.zshrc` config file:
```
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
export PUPPETEER_EXECUTABLE_PATH=`which chromium`
```
or create `.env` file within the same folder and paste them there, then use source:
```
source .env
```
3. Run `yarn` again and be happy!

## Environment for Credentials

Connecting the Cognite SDK client to internal projects through the Cognite API now requires OICD login, meaning that it is no longer sufficient to supply an API key when connecting to these projects. Instead, you need to supply the `tenantId` for the tenant for which the project belongs, as well as the `clientId` for Reveal (or the derived app) within that tenant. This poses a problem when running the examples, which has relied the API keys for authentication.

The examples are configured to run using any environment variables specified in the file `examples/.env`. Specifically, Reveal will use a variable called `REACT_APP_CREDENTIAL_ENVIRONMENT` for authentication. The file `examples/.env.example` shows the expected JSON format of the value contained in this variable. The JSON object may specify several environments. Note that the values provided in `examples/.env.example` are dummy values.

When starting an example that uses the Cognite SDK Client, you can add e.g. `env=example_environment` to use the authentication credential stored in the `example_environment` environment specified in the JSON object.

## Hosting models locally

If you have locally converted 3D models, these can be viewed locally using the "Simple" example by
placing the converted model folder under `examples/public/`, by providing a `modelUrl`-parameter, e.g.
`https://localhost:8080/Simple?modelUrl=/primitives`.

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
consult [legacy-parser-worker/parser-worker/README.md](legacy-parser-worker/parser-worker/README.md)

## Releasing Reveal

See [RELEASING.md](RELEASING.md) for details on how to releasing NPM packages and update
documentation on release.

