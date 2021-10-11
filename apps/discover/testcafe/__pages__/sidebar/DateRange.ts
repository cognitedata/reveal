import { screen } from '@testing-library/testcafe';
import { Selector, t } from 'testcafe';

import { progress } from '../../utils/utils';

class DateRange {
  apply = screen.getByText('Apply');

  setDateRange = async () => {
    // progress(`Setting date range: ${from}`);
    // const element = within(screen.getByRole('tab')).getByPlaceholderText(
    //   'From'
    // );
    // await t.click(element);

    progress(`Opening date range filter`);

    await t.click(Selector('#Calendar'), {
      offsetX: 50,
      offsetY: -30,
      speed: 0.8,
    });

    await t.click(Selector('#Calendar'), {
      offsetX: 110,
      offsetY: 205,
      speed: 0.8,
    });

    await t.click(this.apply);
  };
}

export default new DateRange();
