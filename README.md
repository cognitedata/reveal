# data-exploration-components

## Using the library

To use the `@cognite/data-exploration` library, check out the [storybook](https://cognitedata.github.io/data-exploration-components/).

## Developing locally

You should use storybook as much as possible for local development.
```
yarn storybook
```

Alternatively, if you want to develop `data-exploration-components` locally with `data-exploration` subapp:

1. Install yalc:
```
yarn global add yalc
```

2. In data-exploration-components package:
```
yarn build
yalc publish
```

3. In data-exploration subapp:
```
yalc add @cognite/data-exploration
yarn
```

To develop simultaneously:

In data-exploration-components package:
```
yarn watch
```

In data-exploration subapp:
```
yarn start
```

Now the changes made in data-exploration components should trigger a reload of data-exploration.

## Releasing new version of @cognite/data-exploration

We use [semantic-release](https://github.com/semantic-release/semantic-release) to automate releases. Each merge to `master` will trigger the release workflow. To version correctly, make sure your PR title follows the [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) format.


| PR title | Release type | Version |
|----------|--------------|---------|
| `fix(AssetPreview): make assetId selectable` | [Patch] Fix Release | x.x.1 |
| `feat(MetadataTable): enable sorting` | [Minor] Feature Release | x.1.x |
| `feat(Table)!: implement new interface` | [Major] Breaking Release | 1.x.x |
