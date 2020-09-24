<a href="https://cognite.com/">
    <img src="./cognite_logo.png" alt="Cognite logo" title="Cognite" align="right" height="80" />
</a>

# Reveal 3D viewer and libraries #

[![Build Status](https://travis-ci.org/cognitedata/reveal.svg?branch=master)](https://travis-ci.org/cognitedata/reveal)

Documentation with interactive examples for the latest version is available at [https://cognitedata.github.io/reveal/docs/](https://cognitedata.github.io/reveal/docs/)

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

## Publishing packages

To publish a new version of `@cognite/reveal` or `@cognite/reveal-parser-worker` follow the steps below
(example is for the viewer package, but commands are the same for parser-worker except folder name).

### Git setup

Checkout at some stable revision that you want to release (normally, the latest state from master)
and create a new branch from it. 

```bash
git checkout master
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

The version you specified will be committed and pushed to the remote repository among with the version tag.
Create a PR with the changes.

**Don't merge it yet**, but wait for the CI checks to complete.

### Publish to NPM

Once CI checks are completed – go ahead and publish the package to npm.

Stay on your local branch `<your_username>/<package-name>@<version_to_release>`

Make sure you have access to package publishing.

```bash
# find package name in the list 
npm access ls-packages | grep 'reveal'
``` 

If you see `"@cognite/<package-name>": "read-write"` you're good to go. 
If you don't have access, then you need to create a PR where you add your npm username to access file. See [that PR](https://github.com/cognitedata/terraform-npm/pull/14/files) for example.

If you are not currently logged into npm on your CLI, do the following:
* Run `npm login` (must be `npm login`, not `yarn login`).
* Enter your npm username and password.
* Enable [2FA](https://docs.npmjs.com/configuring-two-factor-authentication) for your npm account. 
    You will need to enter one time password (OTP) to publish a package.

Once logged in, run:

```bash
yarn release
```

It creates a build, copies package.json into /dist with modifications and runs npm publish from viewer/dist.

Now, if published successfully, **merge the pull request**.

### Create a release on GitHub

1. Go to [https://github.com/cognitedata/reveal/releases/new](https://github.com/cognitedata/reveal/releases/new)
1. Under the "Tag version" field, look for the newly-created tag, e.g. `@cognite/reveal@1.0.1`
1. Specify the same release title as the tag name.
1. Write the changes that new version brings. Get inspired by done tasks from your spring board. 
Also, you can check what's committed from the previous tag with that command:
    ```bash
    git log --pretty=format:"%s <%an> – %h" v1.0.0...HEAD
    ```
1. Hit the green "Publish release" button
