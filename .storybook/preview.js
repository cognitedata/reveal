import { SDKProvider } from '@cognite/sdk-provider';
import { DataExplorationProvider } from '@cognite/data-exploration';

import '@cognite/cogs.js/dist/cogs.css';
import 'antd/dist/antd.css';
import 'react-datepicker/dist/react-datepicker.css';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/en';

import mockSDK from '../__mocks__/@cognite/cdf-sdk-singleton';

dayjs.extend(localizedFormat);
dayjs.locale('en');

export const decorators = [
  (Story) => {
    return (
      <SDKProvider sdk={mockSDK}>
        <DataExplorationProvider sdk={mockSDK}>
          <Story />
        </DataExplorationProvider>
      </SDKProvider>
    );
  },
];

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
