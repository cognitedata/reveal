import '@cognite/cogs.js/dist/cogs.css';
import 'antd/dist/antd.css';
import 'rc-collapse/assets/index.css';
import 'react-datepicker/dist/react-datepicker.css';
import dataExplorationDecorator from './providers';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: { expanded: true },
};

export const decorators = [dataExplorationDecorator];
