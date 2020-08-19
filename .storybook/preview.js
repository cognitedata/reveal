import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import antdStyles from '@cognite/cogs.js/dist/antd.css';
import rootStyles from '../src/styles/index.css';

antdStyles.use();
cogsStyles.use();
rootStyles.use();

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
};
