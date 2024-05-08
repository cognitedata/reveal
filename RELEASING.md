Releasing Reveal involves releasing NPM packages `@cognite/reveal` and/or updating documentation. The documentation is automatically
deployed when pushed to master.

# Publishing packages
Publishing of new packages to NPM is handled automatically by a Github Actions workflow which is triggered when publishing a new release on GitHub.
The only consideration you need to make when publishing a new release, is that the NPM package version must be unique meaning that the package version has not been released previously.

### Updating latest documentation
To update the documentation with any changes that might have been added since the last release:

Assuming you are at the root of the project navigate do the documentation folder and run the update script

```bash

cd documentation

# replaces the 'latest' documentation by the 'next'
yarn replace-latest-by-next
```

1. Commit these changes

2. Create a PR with the changes.

Once the PR is merged into master, the documentation will be automatically deployed.

### Create a release on GitHub

1. Go to [https://github.com/cognitedata/reveal/releases/new](https://github.com/cognitedata/reveal/releases/new)
2. Under the "Tag version" field, add a new tag for this release with the name and version of the package, e.g. `@cognite/reveal@3.2.0`
3. Specify the same release title as the tag name.
4. Write the changes that new version brings. Get inspired by done tasks from your sprint board. Note!
   Remember to specify the correct ThreeJS version required by the released version - you can find this in package.json
   of the viewer.
Also, you can check what's committed from the previous tag with that command:
   ```bash
   git log --pretty=format:"* %s" @cognite/reveal@3.2.0...HEAD
   ```
    Use the following template:
```
This version of Reveal is compatible with ThreeJS <THREEJS_VERSION>.

### 🚀 Features

* commit message

### 🐞 Bug fixes and enhancements

* commit message

### ⚠️ Experimental changes

* feat(experimental): commit message
* fix(experimental): commit message

### 📖 Documentation

* commit message

See [installation documentation](https://cognitedata.github.io/reveal-docs/docs/installation) for details about installing Reveal.
```
5. Hit the green "Publish release" button
