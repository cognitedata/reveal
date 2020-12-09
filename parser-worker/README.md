# Reveal parser worker

Used as a dependency for `@cognite/reveal`. 

Parser-worker has some parts written on Rust, so build output contains
worker files and .wasm file.

<!-- TODO: more interesting overview is highly welcomed -->

## Getting started

Note that if you want to simply run the viewer you don't need to build 
parser-worker. It's already used as a dependency from the NPM. 
Build it only if you're about to change parser-worker and want to test local changes.

Also, you might want to build it if you need to create a build with [custom PUBLIC_PATH](https://cognitedata.github.io/reveal/docs/installation#option-2-host-web-worker-and-webassmbly-files-externally)
and host it on your own static server.

Don't forget that if you're committing your changes, you will need to publish a new NPM release. 

### Prerequisites
 
* Install [Node](https://nodejs.org/en/download/)
* Install [Yarn](https://yarnpkg.com/getting-started/install)
* Install [Rust](https://www.rust-lang.org/)

### Install wasm-pack

##### Windows

With Rust installed and ready to go, open a command shell and run `cargo install wasm-pack`

##### Linux / macOS

You can either run the same command as in Windows, or install it faster through https://rustwasm.github.io/wasm-pack/

### Build

```bash
cd ./parser-worker
yarn
yarn build
```

In case if you need to build with custom public path, 
just set the environment variable `PUBLIC_PATH` and run the build.

```bash
PUBLIC_PATH="https://static.server/parser-worker/" yarn build:prod
```  

Notice that environment variable setting syntax differs if you use Windows.

```bash
set PUBLIC_PATH="https://static.server/parser-worker/" && yarn build:prod
```  

If you set the env variable correctly, during the build you should see this printing in your console:

```
> ⬡ <webpack-log>: Worker local build config:
> ⬡ <webpack-log>:  { publicPath: 'https://static.server/parser-worker/' }
```

Now `parser-worker/dist/local` folder contains the built worker and wasm files.
You can host them at your static server.

### Local development

If you want to test your own changes in worker or rust module locally,
all you need to do is to copy files from `parser-worker/dist/local` to some folder in examples.

You can simply use `yarn local-cdn` it does:

* run parser-worker build
* copy files to `examples/public/local-cdn`
* build viewer with publicPath pointing on 'local-cdn' 
* run the examples server.

You will also need to link `@cognite/reveal-parser-worker` to the local version in order to get proper type declarations:

* From `parser-worker/`: `yarn link`
* From `viewer/`: `yarn link @cognite/reveal-parser-worker`

Notice that it builds the viewer with the same
public path, so you don't have to override `revealEnv` in examples. If you do some changes for the viewer at the same time,
you might want to run viewer build separately. For the viewer either build it with the same `PUBLIC_PATH` env variable, or
specify the path to worker files in examples with `revealEnv` (see `examples/routes.tsx`).

If you're not overriding the `revealEnv` with the path to local-cdn -
you should build the viewer with PUBLIC_PATH env variable that points on `/local-cdn` folder.
For example:

```bash
cd ../viewer
PUBLIC_PATH="/local-cdn" yarn build --watch  
``` 

Make sure the path you use for building the parser-worker matches the path
you run examples on (where worker files are available).

In case if you want to test worker changes outside examples, 
you still can use `yarn local-cdn` command,
but notice that you'll need to override path to reveal workers 
with the `revealEnv` in your target project.

```js
import { revealEnv, Cognite3DViewer } from '@cognite/reveal';
revealEnv.publicPath = `https://localhost:3000/local-cdn/`;

// ... then use reveal normally ...
const viewer = new Cognite3DViewer(/*...*/)
```
