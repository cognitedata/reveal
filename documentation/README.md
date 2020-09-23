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

We deploy docs automatically for every merge into master. We have documentation for 2 versions at the moment:
* `1.x` version is default. 
    There should be only documentation for the published versions of `@cognite/reveal`.
    Files for `1.x` are in `/versioned_docs/version-1.x`. **You shouldn't edit these files** unless you want to publish some fix ASAP.
    In that case you need to apply the fix for the both `next` and `1.x` versions.
* `next` contains docs for the latest unpublished `@cognite/reveal` (master branch). 
    You should always edit files for the next version only (they are stored in `/docs` folder).
    Files for `1.x` version are replaced with files from `/docs` for every release. It's handled inside viewer `bump` script.
    
When you write documentation for new features please specify from which version feature is available.
Use the following comment:

```
> **New in 1.1.0**
```

> **New in 1.1.0**
