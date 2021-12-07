import { screen } from '@testing-library/testcafe';
import { t } from 'testcafe';

import { DATE_RANGE_FILTER_FROM_PLACEHOLDER } from '../../../src/pages/authorized/search/search/SideBar/constants';
import { progress } from '../../utils/utils';

class DateRange {
  apply = screen.getByText('Apply');

  setDateRange = async () => {
    progress(`Opening date range filter and clicking apply`);

    await t.click(
      screen.getByPlaceholderText(DATE_RANGE_FILTER_FROM_PLACEHOLDER)
    );
    await t.click(this.apply);
  };
}

export default new DateRange();
