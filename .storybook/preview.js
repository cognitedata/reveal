import { addDecorator } from '@storybook/react';
import { withKnobs } from '@storybook/addon-knobs';
import withProviders from './providers';

addDecorator(withProviders);
addDecorator(withKnobs);
