# data-exploration-components

## Using the library

To use the `@cognite/data-exploration` library, check out the [storybook](https://master--61a5d50c73e912003a269bc9.chromatic.com/).

## Developing locally

### Using storybook

You should use storybook as much as possible for local development
```
yarn storybook
```

Each component should have its own stories. Get started with writing stories by following the [storybook tutorial](https://storybook.js.org/docs/react/writing-stories/introduction) or check the examples [here](https://github.com/storybookjs/storybook).


If you need data from CogniteClient, you can either edit the common [sdkMock object](https://github.com/cognitedata/data-exploration-components/blob/d0aef9846ae18b33dd2fdf6bd1c1edc7c15a530b/src/docs/stub.tsx#L26) or use the `explorerConfig.sdkMockOverride` custom parameter as below.

```ts
const sdkMock = {
      post: async () => ({ data: { items: [{ count: 100 }] } }),
};

export default {
  ...,
  parameters: {
    explorerConfig: { sdkMockOverride: sdkMock },
  },
};
```

### Using `data-exploration` subapp

Alternatively, if you want to develop `data-exploration-components` locally linked to `data-exploration` subapp:

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


| Type | PR title | Release type | Version |
|------|----------|--------------|---------|
| `fix`, `docs`, `test`, `chore`, `refactor` | `fix(AssetPreview): make assetId selectable` | [Patch] Fix Release | x.x.1 |
| `feat`, `style` | `feat(MetadataTable): enable sorting` | [Minor] Feature Release | x.1.x |
| `feat`, `fix`, `style`, `test`, `chore`, `refactor` | `feat(Table)!: implement new interface` | [Major] Breaking Release | 1.x.x |

### Releasing a test version

For the cases where testing a work-in-progress version of the library with the subapp is necessary, prerelease versions can be published to npm.

Provided commits in the branch follow the conventional commit format above, creating a PR on a branch with `prerelease-` prefix will trigger the test version release. This version can then be used to create a second PR in the subapp repo.