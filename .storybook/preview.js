import cogsStyles from '@cognite/cogs.js/dist/cogs.css';
import antdStyles from '@cognite/cogs.js/dist/antd.css';
import collapseStyle from 'rc-collapse/assets/index.css';
import rootStyles from '../src/styles/index.css';

antdStyles.use();
cogsStyles.use();
rootStyles.use();
collapseStyle.use();

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: { expanded: true },
};
