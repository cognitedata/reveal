Releasing Reveal involves releasing NPM packages `@cognite/reveal` and/or `@cognite/reveal-parser-worker` and updating documentation. The documentation is automatically 
updated during the procedure for releasing package `@cognite/reveal`.

# Publishing packages

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

Navigate to the `viewer` (or `parser-worker`) folder and run `yarn version [major/minor/patch]` (for more info, see: https://yarnpkg.com/features/release-workflow)

```bash
cd viewer

# the semver version will change depending on it being a major, minor or patch update
yarn version minor
```

Following, we also want to update the documentation with any changes that might have been added since the last release:

Assuming you are at the root of the project navigate do the documentation folder and run the update script

```bash

cd documentation

# replaces the 'latest' documentation by the 'next'
yarn replace-latest-by-next
```

Commit these changes and optionally add a git tag to this commit (this can also be deferred to later when creating a release in GitHub):

```bash
git tag @cognite/reveal@<version>
git push --tags
```

Create a PR with the changes.

**Don't merge it yet**, but wait for the CI checks to complete.

**Tip**: if something went wrong with the build, and you want to apply some fix, 
don't forget to remove git tags that were created. 

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
yarn
yarn build:prod
cd dist
npm publish
```

or if you are releasing a beta version:

```bash
yarn
yarn build:prod
cd dist
npm publish --tag=beta
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
Reveal comes with ThreeJS embedded so you do not have this as a dependency in your project. If you still want to have it as a direct dependency, it must match the version used by Reveal (r<THREEJS_VERSION>). You can also use three.js version exported by Reveal as import { THREE } from '@cognite/reveal.

### 🚀 Features

* commit message

### 🐞 Bug fixes and enhancements

* commit message

### 📖 Documentation

* commit message

See [installation documentation](https://cognitedata.github.io/reveal-docs/docs/installation) for details about installing Reveal.
```
1. Hit the green "Publish release" button
