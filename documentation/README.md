# Website

This [documentation website](https://cognitedata.github.io/reveal-docs/docs/) is built using [Docusaurus 2](https://v2.docusaurus.io/), a modern static website generator.

### Installation

```
$ yarn
```

### Local Development

```
$ yarn start
```

This command starts a local development server and open up a browser window. Most changes are reflected live without having to restart the server.

#### .env file

See `.env.example` to override project or model ids for local development. You need to copy it as `.env` file. It won't be commited.

### Build

```
$ yarn build
```

This command generates static content into the `build` directory and can be served using any static contents hosting service.

### Deployment

We deploy docs automatically for every merge into master. See workflows for details.

There are 2 repos where we host our docs:

* https://github.com/cognitedata/reveal-docs – for production documentation
* https://github.com/cognitedata/reveal-docs-preview - for PR previews

Also, reveal has own [gh-pages](https://github.com/cognitedata/reveal/settings/pages)
but it's merely has redirects [here](https://github.com/cognitedata/reveal/blob/gh-pages/index.html) and [there](https://github.com/cognitedata/reveal/blob/gh-pages/docs/index.html)
to reveal-docs, i.e.

`cognitedata.github.io/reveal/docs` → `cognitedata.github.io/reveal-docs`

### Versioning

![reveal-docs-versioning.png](static/img/reveal-docs-versioning.png)

We have several versions of our documentation for different reveal versions. We always have at least:

* `next` (`/docs` folder) – your main place to create documentation for new features. 
    Write docs well before release, and you won't need to edit other sections ever.
* `2.x` or latest (`/versioned_docs/version-2.x/` folder). 
  On the website this is default documentation section for users because it describes
  the latest reveal version that published to NPM. Edit the latest version only when you want
  to apply some hotfix to documentation of the release that already published.
  **You must also apply the same fix to `next` version**
  because `/versioned_docs/version-2.x/` is completely replaced by `next` on every release.  
* `1.x` or other archived versions. They must be created on each major release. 
  You need to edit those only when you want to clarify docs for older published reveal versions
  that are not actively maintained anymore.

We typically don't version minor versions. Instead, mark every new feature with comment like:

```
> **New in 2.1.0**
```

For API reference use `@version` tag in jsdoc. For example:

```js
/**
  * Sets transformation matrix of the model.
  * @param transformationMatrix
  * @version Added in 2.1.0
  */
```

Notice that `documentation/static` is not versioned, so if you remove something from there – double check that it's not used by other versions.

#### How to create new docs version?

Let's say you want to roll out new reveal@2.0.0, that what needs to be done:

* create new 2.x section and make it default for docs website 
* tweak copying of next version to replace your 2.x with updates on every release
* introduce a new versioned dependency on reveal in your archived version
* configure search

##### Create new 2.x section

[[Docusaurus versioning guide](https://docusaurus.io/docs/2.0.0-beta.0/versioning)] 
for the version of docusaurus you currently use, but basic usage is covered below.

Basically you need to copy the whole content of your `next` version under `versioned_docs` and version sidebars as well.
Run this command to do it:

```bash
yarn docusaurus docs:version 2.x
```

That will become default version for the docs website.

##### Tweak copying of next version into your 2.x version

The copying should happen on every reveal release (called by bump `scrips`).

It's handled by `yarn run replace-latest` script, but for a new version you need to adjust version name in that script. 
So, go to `package.json` and do that change at `replace-latest` script

```diff
- "replace-latest-by-next": "yarn apiref && rimraf versioned_sidebars/version-1.x-sidebars.json versioned_docs/version-1.x versions.json && yarn docusaurus docs:version 1.x && git checkout HEAD -- versions.json"
+ "replace-latest-by-next": "yarn apiref && rimraf versioned_sidebars/version-2.x-sidebars.json versioned_docs/version-2.x versions.json && yarn docusaurus docs:version 2.x && git checkout HEAD -- versions.json"
```

##### Introduce a new versioned dependency on reveal in your archived version

That step is needed because we are actually using reveal in docs, so docs not just docs, but they have a dependency on reveal to show live demos.

So when you archive a version you must fix the version of reveal for that part of the documentation website.

Below is an example of archiving `1.x` version.

1. Go to `documentation/package.json`
2. Add aliased fixed dependency, e.g. `"@cognite/reveal-1.x": "npm:@cognite/reveal@^1.5.5",`
3. At `versioned_docs/1.x`:
   * replace all `@cognite/reveal` appearances in imports with `@cognite/reveal-1.x`
   * replace all `runnable` annotations with `runnable-1x`
4. At `remark-runnable-reveal-demo.js` add a new record to the `versionedImportNode`:
  ```js
      'runnable-1x': {
        type: 'import',
          value:
        "import { LiveCodeSnippet } from '@site/versioned_docs/version-1.x/components/LiveCodeSnippet';",
      },
  ```

##### Configure search

[[Docusaurus guide on search](https://docusaurus.io/docs/2.0.0-beta.0/search)]

Find `algolia` at `docusaurus.config.js` and adjust `facetFilters` param by adding your new version. E.g. 

```js
    facetFilters: [['version:1.x', 'version:2.x']]
```

That's pretty much all you need to do to create a new version of your docs.
