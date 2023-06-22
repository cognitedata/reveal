# `get-affected` Github Action

A Github Action making it easy to check if a local workspace changed using NX

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
        id: changes
        uses: ./scripts/github-actions/get-affected
        with:
          currentSHA: HEAD^1

      # Do something more meaningful here, like push to NPM, do heavy computing, etc.
      - name: Validate Action Output
        if: steps.changes.outputs.maintain == 'true' # Check output if it changed or not (returns a boolean)
        run: echo 'maintain has changed!'
```

### Options

The following options can be passed to customize the behavior of the action:

| Option Name    | Description                                               | Default Value |
| -------------- | --------------------------------------------------------- | ------------- |
| `currentSHA`   | **(Required)** The sha you want to check chagnes against. | NA            |
