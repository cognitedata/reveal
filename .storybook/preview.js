import { addDecorator } from '@storybook/react';
import appProvidersDecorator from './appProvidersDecorator';

import '@cognite/cogs.js/dist/cogs.css';

addDecorator(appProvidersDecorator);
