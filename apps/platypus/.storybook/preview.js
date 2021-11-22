import { addDecorator } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import { configureI18n } from '@cognite/react-i18n';
// import withProviders from './providers';
import '@cognite/cogs.js/dist/cogs.css';

// export const parameters = {
//   actions: { argTypesRegex: '^on[A-Z].*' },
//   controls: {
//     matchers: {
//       color: /(background|color)$/i,
//       date: /Date$/,
//     },
//   },
// };

configureI18n();
// addDecorator(withProviders);
addDecorator(withKnobs);
