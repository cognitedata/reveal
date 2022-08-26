import '@cognite/cogs.js/dist/cogs.css';
import 'antd/dist/antd.css';
import 'react-datepicker/dist/react-datepicker.css';

import dayjs from 'dayjs';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/en';

dayjs.extend(localizedFormat);
dayjs.locale('en');

export const parameters = {
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
