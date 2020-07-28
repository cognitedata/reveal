# Subsurface Components

This project contains common interfaces used in subsurface packages

## Usage for cognite npm members

This package is available as a private package in [npm](https://www.npmjs.com/package/@cognite/subsurface-components).
To use this library user must be a member of cognite organization in npm.

- login to npm and follow steps : `npm login`
- install library : `npm i @cognite/subsurface-components`

## Usage - Without npm login

- first build the project from the root folder of this repo : `npm run build`
- now there should be build artifact in **dist/subsurface-components** directory.
- go to the folder and run npm link: `cd dist/subsurface-components` and `npm link`
- navigate to you project and use the library in your project: `npm link @cognite/subsurface-components`

## Available components

| Component                                                                                                      | Version |
| -------------------------------------------------------------------------------------------------------------- | :-----: |
| [Virtual Tree](https://github.com/cognitedata/subsurface-visualization/tree/master/src/Components/VirtualTree) |  0.0.1  |
