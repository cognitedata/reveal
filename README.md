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
consult [parser-worker/README.md](parser-worker/README.md)

## Publishing packages

To publish a new version of `@cognite/reveal` or `@cognite/reveal-parser-worker` follow the steps below
(example is for the viewer package, but commands are the same for parser-worker except folder name).

### Create release branch

Checkout at some stable revision that you want to release (normally, the latest state from master or
version-1 if you are releasing fix for a previous version) and create a new branch from it. 

```bash
git checkout master # or version-1 if you are releasing a hotfix to 1.x.x
git pull
git checkout -b <your_username>/<package-name>@<version_to_release>
```

### Bump version and create a PR

Navigate to the `viewer` (or `parser-worker`) folder and run `yarn bump` script 

```bash
cd viewer

# it will ask you to enter a new version number
yarn bump
```

The version you specified will be committed and pushed to the remote repository among with the version tag. For production releases use the regular `x.y.z`-notation. For pre-releases use
`x.y.z-beta.w`. Create a PR with the changes.

**Don't merge it yet**, but wait for the CI checks to complete.

**Tip**: if something went wrong with the build, and you want to apply some fix, 
don't forget to remove git tags that were created after running `yarn bump`. 

<details>
  <summary>Git tags removing example</summary>

  ```bash
  git push --delete origin @cognite/reveal-parser-worker@1.1.1
  git tag -d @cognite/reveal-parser-worker@1.1.1
  ```
</details>

### Publish to NPM

Once CI checks are completed – go ahead and publish the package to npm.

Stay on your local branch `<your_username>/<package-name>@<version_to_release>`

Make sure you have access to package publishing.

```bash
# find package name in the list 
npm access ls-packages | grep 'reveal'
``` 

If you see `"@cognite/<package-name>": "read-write"` you're good to go. 
If you don't have access, then you need to create a PR where you add your npm username to access file. See [this pull request](https://github.com/cognitedata/terraform-npm/pull/14/files) for example.

If you are not currently logged into npm on your CLI, do the following:
* Run `npm login` (must be `npm login`, not `yarn login`).
* Enter your npm username and password.
* Enable [2FA](https://docs.npmjs.com/configuring-two-factor-authentication) for your npm account. 
    You will need to enter one time password (OTP) to publish a package.

Once logged in, run:

```bash
yarn release
```

or if you are releasing a beta version:

```bash
yarn release --tag=beta
```

It creates a build, copies package.json into /dist with modifications and runs npm publish from viewer/dist.

Now, if published successfully, **merge the pull request**.

In case if you're releasing reveal-parser-worker, you must upload it to CDN after successful release. 
To do that, go to GitHub Actions and run [Upload worker workflow](https://github.com/cognitedata/reveal/actions/workflows/upload-worker.yml)
targeting the master branch.

### Create a release on GitHub

1. Go to [https://github.com/cognitedata/reveal/releases/new](https://github.com/cognitedata/reveal/releases/new)
1. Under the "Tag version" field, look for the newly-created tag, e.g. `@cognite/reveal@2.1.0`
1. Specify the same release title as the tag name.
1. Write the changes that new version brings. Get inspired by done tasks from your sprint board. Note! 
   Remember to specify the correct ThreeJS version required by the released version - you can find this in package.json 
   of the viewer.
Also, you can check what's committed from the previous tag with that command:
   ```bash
   git log --pretty=format:"* %s" @cognite/reveal@2.0.0...HEAD
   ```
   Use the following template:
   ```md
   This is a beta release of the next major version of Reveal. Reveal 2.0 comes with ThreeJS embedded so you do not have this as a dependency in your project. If you still want to have it as a direct dependency, it must match the version used by Reveal (r<version>). You can also use three.js version exported by Reveal as `import { THREE } from '@cognite/reveal`.

   ### 🚀 Features
   
   * commit message
   
   ### 🐞 Bug fixes and enhancements
   
   * commit message
   
   ### 📖 Documentation
   
   * commit message

   See [installation documentation](https://cognitedata.github.io/reveal-docs/docs/installation) for details about installing Reveal.
   ```
1. Hit the green "Publish release" button
