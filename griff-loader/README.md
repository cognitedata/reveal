# @cognite/griff-loader

- [Installing](#installing)
- [Developing Locally](#requirements)
- [Contributing](#contributing)
- [License](#license)

## Installing

```
$ yarn add @cognite/griff-loader
```

## Developing Locally

```
$ git clone
$ yarn
$ yarn test
```

Link this library to your target

In griff-loader

`yarn link`

In your target application
`yarn link @cognite/griff-react`

If you start `yarn watch` it'll automatically build your target application if you have hot reloading available.

## Using

createLoader is a function that creates a data loader based on some given optional parameters.

Optional parameters:

- scaleYAxis: boolean: whether the yAxis (ySubDomain) should be adjusted when a time subdomain changes. This defaults to false.

## Contributing

1.  Clone this repo
2.  Create a branch: `git checkout -b your-feature`
3.  Make some changes
4.  Test your changes by [running your local version](#developing-locally)
5.  Push your branch and open a Pull Request

## License

This code is open source software licensed under the Apache 2.0 License.
