# Reveal parser worker

Used as a dependency for `@cognite/reveal`. 

Parser-worker has some parts written on Rust, so build output contains
worker files and .wasm file.

<!-- TODO: more interesting overview is highly welcomed -->

## Getting started

Note that if you want to simply run the viewer you don't need to build 
parser-worker. It's already used as a dependency from the NPM. 
Build it only if you're about to change parser-worker and want to test local changes.

Also, you might want to build it if you need to create a build with [custom PUBLIC_PATH](https://cognitedata.github.io/reveal/docs/installation#if-you-cant-host-workers-on-the-same-domain)
and host it on your own static server.

Don't forget that if you're committing your changes, you will need to publish a new NPM release. 

### Prerequisites
 
Install [Node](https://nodejs.org/en/download/)
Install [Rust](https://www.rust-lang.org/)

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
export PUBLIC_PATH=https://static.server/parser-worker/ && yarn build:prod
```  

Notice that environment variable setting syntax differs if you use Windows.

```bash
set PUBLIC_PATH=https://static.server/parser-worker/ && yarn build:prod
```  

If you set the env variable correctly, during the build you should see this printing in your console:

```
> ⬡ <webpack-log>: Worker local build config:
> ⬡ <webpack-log>:  { env: undefined, publicPath: 'https://static.server/parser-worker/' }
```

Now `parser-worker/dist/local` folder contains the built worker and wasm files.
You can host them at your static server.

### Local development

If you want to test your own changes in worker or rust module locally,
all you need to do is to copy files from `parser-worker/dist/local` to some folder in examples.

You can simply use `yarn local-cdn` which will run build,
then copy files to `examples/public/local-cdn` and run the examples server. 

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
