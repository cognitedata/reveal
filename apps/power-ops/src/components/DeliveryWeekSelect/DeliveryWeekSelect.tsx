import { Dropdown, Menu } from '@cognite/cogs.js-v9';
import dayjs from 'dayjs';
import { ComponentProps, useState } from 'react';
import isoWeek from 'dayjs/plugin/isoWeek';
import {
  DeliveryWeekButton,
  MenuItem,
} from 'components/DeliveryWeekSelect/elements';
import { getDeliveryWeekOptions } from 'pages/RKOM/utils';

dayjs.extend(isoWeek);

interface Props
  extends Omit<
    ComponentProps<typeof Dropdown>,
    'hideOnSelect' | 'content' | 'children'
  > {
  /** The value is the initial date of the week formatted as YYYY-MM-DD */
  value: string;
  /** Change event. The value is the initial date of the week formatted as YYYY-MM-DD */
  onChange: (value: string) => void;
  options: ReturnType<typeof getDeliveryWeekOptions>;
}

export const DeliveryWeekSelect = ({
  value,
  onChange,
  options,
  ...rest
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dropdown
      hideOnSelect
      content={
        <Menu className="delivery-week-dropdown">
          {options.map(({ startDate, weekNumber, endDate }) => {
            const startDateJs = dayjs(startDate);
            const endDateJs = dayjs(endDate);
            return (
              <Menu.Item
                toggled={startDate === value}
                key={weekNumber}
                onClick={() => onChange(startDate)}
                css={{}}
              >
                <MenuItem>
                  <div>
                    Week {weekNumber}, {startDateJs.year()}
                    <p>
                      {startDateJs.format('DD MMM, YYYY')} -{' '}
                      {endDateJs.format('DD MMM, YYYY')}
                    </p>
                  </div>
                </MenuItem>
              </Menu.Item>
            );
          })}
        </Menu>
      }
      {...rest}
    >
      <DeliveryWeekButton
        data-testid="delivery-week-button"
        theme="grey"
        title="Delivery Week:"
        disableTyping
        onClick={() => setOpen(!open)}
        value={
          value && {
            value: `Week ${dayjs(value).isoWeek()}`,
            label: `Week ${dayjs(value).isoWeek()}`,
          }
        }
      />
    </Dropdown>
  );
};
