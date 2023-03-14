# cdf-nx-plugin

Local plugin generators provide a way to automate many tasks you regularly perform as part of your development workflow.

This CDF NX Plugin will be used for scaffolding out components, features, or ensuring libraries and fusion sub-apps are generated and structured in a certain way, consistent, and predictable manner.

The plugin will keep all executors and generators in one places so we can extend it and add more features as needed.

Read more here [here](https://nx.dev/recipes/generators/local-generators)

`Note! When you use VS code and NX Console you have to reload window before changes to your generator will be visible to NX Console.`

## Building

Run `nx build cdf-nx-plugin` to build the library.

## Running unit tests

Run `nx test cdf-nx-plugin` to execute the unit tests via [Jest](https://jestjs.io).

# Testing

What is great with NX Plugin is that it comes with unit and e2e tests.
It's easy to check that generated files are correct withour polluting your own repo with test libraries. It's also easy to add unit tests for generators. Here is small example how to test that generator is adding files correctly.

```typescript
// generator.spec.ts
// ...
it('should create readme', async () => {
  await generator(appTree, options);
  const readme = appTree.read('libs/test/README.md');
  expect(readme.toString()).toMatchInlineSnapshot(`
      "# Test

      This is React library for web

      type: data
      scope: shared
      "
    `);
});
```
