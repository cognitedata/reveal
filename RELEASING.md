Releasing Reveal involves releasing NPM packages `@cognite/reveal` and/or `@cognite/reveal-parser-worker` and updating documentation. The documentation is automatically 
updated during the procedure for releasing package `@cognite/reveal`.

# Publishing @cognite/reveal NPM package

To publish a new version of `@cognite/reveal` follow the steps below
## Create release branch

Checkout at some stable revision that you want to release (normally, the latest state from master or
version-1 if you are releasing fix for a previous version) and create a new branch from it. 

```bash
git checkout master # or version-1 if you are releasing a hotfix to 1.x.x
git pull
git checkout -b <your_username>/@cognite/reveal@<version_to_release>
```

## Bump version and create a PR

Navigate to the `viewer` folder and run the following to bump version:

```bash
cd viewer
# Install dependencies
yarn
# Update version in package.json
yarn version <version_to_release>
# Commit the bump
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
  git push --delete origin @cognite/reveal@1.1.1
  git tag -d @cognite/reveal@1.1.1
  ```
</details>

## Publish to NPM

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
## Create a release on GitHub

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

# Publishing @cognite/reveal-parser-worker NPM package

Approach is very similar to releasing `@cognite/reveal`, but differs a bit due to different versions of yarn being used.

## Create release branch

Checkout at some stable revision that you want to release (normally, the latest state from master or
version-1 if you are releasing fix for a previous version) and create a new branch from it. 

```bash
git checkout master # or version-1 if you are releasing a hotfix to 1.x.x
git pull
git checkout -b <your_username>/@cognite/reveal-parser-worker@<version_to_release>
```

## Bump version and create a PR

Navigate to the `parser-worker` folder and run `yarn bump` script 

```bash
cd viewer
# Install dependencies
yarn

# it will ask you to enter a new version number
yarn bump
```

The version you specified will be committed and pushed to the remote repository among with the version tag. For production releases use the regular `x.y.z`-notation. For pre-releases use
`x.y.z-beta.w`. Create a PR with the changes.

**Don't merge it yet**, but wait for the CI checks to complete.

## Publish to NPM

Once CI checks are completed – go ahead and publish the package to npm.

Stay on your local branch `<your_username>/@cognite/reveal-parser-worker@<version_to_release>`

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

## Upload worker to CDN

After successful release, the worker package must be uploaded to CDN so Reveal can fetch the worker runtime.

To do that, go to GitHub Actions and run [Upload worker workflow](https://github.com/cognitedata/reveal/actions/workflows/upload-worker.yml)
targeting the master branch.
