# Reveal React Components
This library contains react components to augment applications using Reveal.

## Building and installing
Note that this library depends on an internal Cognite design library (`cogs.js`) and is therefore not usable for non-cognite applications (sorry...).
To be able to fetch internal packages you must be logged into yarn with `yarn npm login`.

After authenticating and installing, build can be done with the following commands:

```
yarn
yarn run build
```

## Running locally
Components can be tested, visualized and developed using storybook:
```
yarn run storybook
```


## Using reveal react components in /examples
As we want `/examples` to continue working out-of-the-box by external users, you must do some manual adjustments if you want to test a components.

Some changes must be made to `/examples/package.json`,

From:
<pre><code>
"dependencies": {
  ...
  "react": "x.x.x",
  "react-dom": "x.x.x",
  "styled-components": "x.x.x",
}
</code></pre>

To:
<pre><code>
"dependencies": {
  ...
  <mark style="background-color: Gold;">"react": "link:../react-components/node_modules/react",</mark>
  <mark style="background-color: Gold;">"react-dom": "link:../react-components/node_modules/react-dom",</mark>
  <mark style="background-color: Gold;">"styled-components": "link:../react-components/node_modules/styled-components",</mark>
  <mark style="background-color: LightGreen;">"@cognite/reveal-react-components": "link:../react-components",</mark>
}
</code></pre>

The reason for these changes is that when `@cognite/reveal-react-components` is symlinked, we must ensure that the application and the library resolve to the same version of react to avoid conflicts.

In addition, `@cognite/reveal-react-components` has a peer-dependency, so `cogs.js` must also be installed:

```
yarn add @cognite/cogs.js
```
