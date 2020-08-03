// @ts-nocheck
import { configure } from '@storybook/react';
import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import antdStyles from '@cognite/cogs.js/dist/antd.css';
import rootStyles from '../src/styles/index.css';

antdStyles.use();
cogsStyles.use();
rootStyles.use();

configure(require.context('../src', true, /\.stories\.tsx$/), module);
