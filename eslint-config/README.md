# @cognite/eslint-config

This provides styleguide for JS/ES through eslint rules and prettier formatter.

### Installation

To use this package in your repository, run the following command:

```sh
yarn add --dev \
  @cognite/eslint-config \
  babel-eslint eslint \
  eslint-config-airbnb \
  eslint-config-prettier \
  eslint-plugin-import \
  eslint-plugin-jest \
  eslint-plugin-jsx-a11y \
  eslint-plugin-prettier \
  eslint-plugin-react prettier
```

Finally, create a `.eslintrc.js` file in the root of your project:

```js
module.exports = {
  extends: ['@cognite'],
};
```

### Rules:

We use [Airbnb](https://github.com/airbnb/javascript/) as a base for our styleguide, and we use prettier as a formatter.
This means that we extend the prettier config and `eslint --fix` will use prettier to format your code.

We also extend the recommended rules for Jest tests.

Exceptions to the standard prettier config is singlequotes and dangling commas.

Babel parser is used to eslint to parse experimental ES syntax.
