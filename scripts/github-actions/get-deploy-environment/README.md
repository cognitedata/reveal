### Get firebase environemt

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

      - name: Get deploy environment
        id: deploy-env
        uses: ./scripts/github-actions/get-deploy-environment
        with:
          project:
          description: 'Branch name where the actions is running'
```
