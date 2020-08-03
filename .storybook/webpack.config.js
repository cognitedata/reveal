const path = require('path');

module.exports = async ({ config, mode }) => {
  config.node = {
    '@cognite/cdf-sdk-singleton': 'mock',
  };
  config.resolve.alias = {
    ...config.resolve.alias,
    '@cognite/cdf-sdk-singleton': path.resolve(
      __dirname,
      'sdk-singleton-mock.js'
    ),
  };
  // console.log(config.module.rules);
  config.module.rules = config.module.rules
    .filter((el) => !'index.css'.match(el.test))
    .concat([
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              esModule: true,
              injectType: 'lazyStyleTag',
            },
          },
          'css-loader',
        ],
        include: path.resolve(__dirname, '../'),
      },
    ]);
  return config;
};
