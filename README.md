# Getting started with Platypus

[TOC]

## Setup

First, Install Nx with npm:

Make sure the nx is on version 13.x.x!

```
npm install -g nx
```

Then you can install the node_modules by running

```
yarn
```

## CLI

NX provides CLI for developing different types of applications and different tools. These capabilities include generating applications, libraries, etc as well as the devtools to test, and build projects as well.

Please read more about how to use the NX CLI here:
https://nx.dev/l/r/getting-started/nx-cli

If you don't want to bother and learn all the commands and you are using VsCode, you can install their extension `Nx Console` and have nice UI from where you can do everything.

### Usefull CLI commands

To run/serve any app, just run:

`nx serve name-of-the-app`

To test any app/library:

`nx test name-of-the-app`

To build the app/library:

`nx build name-of-the-app`

The output can be found in the `dist` folder.

# Platypus App

You can find the code under `apps/platypus`.

To run:

`nx serve platypus`

To build:

`nx build platypus`

To test:

`nx test platypus`

# Platypus CLI

You can find the code under `libs/platypus-cli`.

To build:

`nx build platypus`

To test:

`nx test platypus`

To run:

First build the library, then you can
`node dist/libs/platypus-cli/src/index.js init <other-args>`
