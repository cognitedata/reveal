import { addDecorator } from '@storybook/react';
import appProvidersDecorator from './appProvidersDecorator';
import { configureI18n, I18nContainer } from '@cognite/react-i18n';

import '@cognite/cogs.js/dist/cogs.css';

configureI18n();

addDecorator(appProvidersDecorator);
