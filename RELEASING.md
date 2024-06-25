Releasing Reveal involves releasing NPM packages `@cognite/reveal` and/or updating documentation. The documentation is automatically
deployed when pushed to master.

# Publishing packages

### Update the package version

First, Reveal's package version must be incremented. This is done by changing the "version" field at the top of `viewer/package.json`. We use [semantic versioning](https://semver.org/#summary). Increment patch version if the changes are purely internal or only affects experimental features (so e.g. 4.14.1 becomes 4.14.2), or increment minor version if there are new features added (new types, functions, classes, new fields in already-existing types).

Submit a PR with the version number update. Make sure it has been merged before continuing with the next steps.

### Create a release on GitHub

1. Go to [https://github.com/cognitedata/reveal/releases/new](https://github.com/cognitedata/reveal/releases/new)
2. Under the "Tag version" field, add a new tag for this release with the name and version of the package, e.g. `@cognite/reveal@3.2.0`
3. Specify the same release title as the tag name.
4. Write the changes that new version brings. Use the commit history. You can check what's committed from the previous tag (in this case, 3.1.9) with this command:
   ```bash
   git log --pretty=format:"* %s" @cognite/reveal@3.1.9...HEAD
   ```

Note!
   Remember to specify the correct ThreeJS version required by the released version - you can find this in package.json
   of the viewer.

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


### Publish the NPM package

Then, to publish the NPM package, go to Actions at the top of the Github-page, then find "Publish Package to NPM" to the right. Click "Run workflow", and the package should be underway.

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
