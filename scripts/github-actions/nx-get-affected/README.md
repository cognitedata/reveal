# `get-affected` Github Action

A Github Action making it easy to get list of affected project or check if a local workspace changed using NX

## How to use

Here is a minimal example of how to use the action to check if a workspace changed:

```yaml
name: 'example-push'
on: push

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v3
        with:
          fetch-depth: 0 # Necessary so we have commit history to compare to

      - name: Get changes
        id: affected
        uses: ./scripts/github-actions/get-affected
        with:
          base: { some SHA } #[OPTIONAL] defaults to `origin/master`
          head: { some SHA } #[OPTIONAL] defaults to `HEAD`
          target: 'test' #[OPTIONAL] defaults to `build`
          type: 'apps' #[OPTIONAL]

      # Do something more meaningful here, like push to NPM, do heavy computing, etc.
      - name: Get list of affected projects
        run: echo ${{steps.affected.outputs.list}}

      - name: Validate Action Output
        if: steps.affected.outputs.maintain == 'true' # Check output if it changed or not (returns a boolean)
        run: echo 'maintain has changed!'
```

### Options

The following options can be passed to customize the behavior of the action:

| Option Name  | Description                                               | Default Value |
| ------------ | --------------------------------------------------------- | ------------- |
| `currentSHA` | **(Required)** The sha you want to check chagnes against. | NA            |
