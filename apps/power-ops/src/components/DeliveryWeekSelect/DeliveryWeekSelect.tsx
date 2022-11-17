import { Dropdown, Icon, Menu } from '@cognite/cogs.js';
import dayjs from 'dayjs';
import { ComponentProps, useState } from 'react';
import isoWeek from 'dayjs/plugin/isoWeek';
import {
  DeliveryWeekButton,
  MenuItem,
} from 'components/DeliveryWeekSelect/elements';
import { deliveryWeekOptions } from 'pages/RKOM/utils';

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
  options?: typeof deliveryWeekOptions;
}

export const DeliveryWeekSelect = ({
  value,
  onChange,
  options = deliveryWeekOptions,
  ...rest
}: Props) => {
  const [open, setOpen] = useState(false);

  return (
    <Dropdown
      hideOnSelect
      content={
        <Menu className="delivery-week-dropdown" onClick={() => setOpen(!open)}>
          {options.map(({ startDate, weekNumber, endDate }) => {
            const startDateJs = dayjs(startDate);
            const endDateJs = dayjs(endDate);
            return (
              <Menu.Item
                selected={startDate === value}
                key={weekNumber}
                onClick={() => onChange(startDate)}
              >
                <MenuItem>
                  <div>
                    Week {weekNumber}, {startDateJs.year()}
                    <p>
                      {startDateJs.format('DD MMM, YYYY')} -{' '}
                      {endDateJs.format('DD MMM, YYYY')}
                    </p>
                  </div>
                  {startDate === value && <Icon type="Checkmark" />}
                </MenuItem>
              </Menu.Item>
            );
          })}
        </Menu>
      }
      {...rest}
    >
      <DeliveryWeekButton
        className="delivery-week-button"
        type={open ? 'tertiary' : 'secondary'}
        onClick={() => setOpen(!open)}
      >
        <div className="delivery-week-item">
          <strong>Delivery Week:&nbsp;</strong>
          {value && `Week ${dayjs(value).isoWeek()}`}
        </div>
        <Icon
          type={open ? 'ChevronUp' : 'ChevronDown'}
          style={{ color: 'hsl(0,0%,50%)' }}
        />
      </DeliveryWeekButton>
    </Dropdown>
  );
};
