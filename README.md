<a href="https://cognite.com/">
<picture>
  <source media="(prefers-color-scheme: dark)" srcset="./cognite_logo_dark.png">
  <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</picture>
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

If you now navigate to [localhost:3549](https://localhost:3549), the browser should show a simple 3D model with a UI.

To show a model from your own CDF project, you must first configure Reveal to use your CDF credentials. Follows the steps in the section [Credentials Environment](#Credentials-Environment).

change the URL to `https://localhost:3000/?project=<project>&env=<environment>&modelId=<modelId>&revisionId=<revisionId>`.

Here, `<project>` is the name of the CDF project you want to connect to, `<environment>` is the name of the environment specified in the `.env` file (e.g. `example_environment`), and `<modelId>` and `<revisionId>` are the ids of the model you want to visualize. You can find these IDs in Cognite Fusion, in the "Upload 3D models" / "Manage 3D" subapp.

### Troubleshooting

Occasionally, and always the first time you login to an environment, you may get a 401 error in the browser, which, after clicking through, resets the browser window to the model with colorful shapes. In this case, there should be a `#code=...`-segment appended to the URL in the browser. Copy the URL you tried to visit (including the project, environment and IDs), and paste it to the left of the `#`-sign in the URL, replacing everything that was there before. In other words, your URL should now look like

```
https://localhost:3000/?project=<project>&env=<environment>&modelId=<modelId>&revisionId=<revisionId>#code=<access token>
```

Press enter to reload.

This may or may not work on the first try, seemingly depending on the access token expiration or other factors. If it fails at first, you may try this step multiple times, it will usually work by the 5th attempt.

### Building on Macbook M1

Building Reveal on Macbook M1 might require some special care.

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

## Credentials Environment

The examples are configured to run using any environment variables specified in the file `examples/.env`, which you create yourself.  The file `examples/.env.example` shows the expected JSON format of the value contained in this variable. You must fill in the appropriate values for your environment in this file; The tenant ID, client ID and the cluster of the CDF project you want to use.

Ask your Cognite contact for the tenant ID and client ID if you don't have these available.

The cluster value is the name of the subdomain in which the project resides. To find its value for your project, log in to your project in Cognite Fusion and observe that the URL ends with a string akin to `cluster=<cluster>.cognitedata.com`. Here, `<cluster>` is the name you should put in the `.env` file.

When starting an example, you can add e.g. `env=example_environment` to use the authentication credential stored in the `example_environment` environment specified in `.env`.

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

## Releasing Reveal

See [RELEASING.md](RELEASING.md) for details on how to releasing NPM packages and update
documentation on release.
