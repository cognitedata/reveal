import { useMemo, useState } from 'react';
import { Calendar } from 'react-date-range';

import {
  format,
  formatISO9075,
  getDate,
  getMonth,
  getYear,
  set,
} from 'date-fns';
import { Field, useFormikContext } from 'formik';

import type { OptionType } from '@cognite/cogs.js';
import {
  Colors,
  Dropdown,
  Input,
  Menu,
  Select,
  Switch,
} from '@cognite/cogs.js';
import type { CalculationTemplate } from '@cognite/simconfig-api-sdk/rtk';

import {
  FormContainer,
  FormHeader,
  FormRow,
  NumberField,
} from 'components/forms/elements';

export function ScheduleStep() {
  const closeCalendar = () => {
    setIsCalendarVisible(false);
  };

  const { values, setFieldValue } = useFormikContext<CalculationTemplate>();

  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const scheduleRepeat = useMemo((): ScheduleRepeat => {
    const count = parseInt(values.schedule.repeat, 10);
    const interval =
      values.schedule.repeat.match(/[dhm]/)?.[0] ?? intervalOptions[0].value;
    const intervalOption = intervalOptions.find(
      (it) => it.value === values.schedule.repeat.match(/[dhm]/)?.[0]
    );
    return { count, interval, intervalOption };
  }, [values.schedule.repeat]);

  const setScheduleRepeat = ({
    count = scheduleRepeat.count,
    interval = scheduleRepeat.interval,
  }: Partial<ScheduleRepeat>) => {
    setFieldValue('schedule.repeat', `${count}${interval}`);
  };

  const scheduleStart = useMemo(() => {
    const date = new Date(values.schedule.start);
    const dateString = formatISO9075(date, { representation: 'date' });
    const timeString = format(new Date(values.schedule.start), 'HH:mm');
    return { date, dateString, timeString };
  }, [values.schedule.start]);

  const setScheduleStart = ({
    date = scheduleStart.date,
    timeString = scheduleStart.timeString,
  }: Partial<ScheduleStart>) => {
    const [hours = 0, minutes = 0] = timeString.split(':');
    setFieldValue(
      'schedule.start',
      set(date, {
        year: getYear(date),
        month: getMonth(date),
        date: getDate(date),
        hours: +hours,
        minutes: +minutes,
      }).getTime()
    );
  };

  return (
    <FormContainer>
      <FormHeader>
        Schedule calculation runs
        <Field
          as={Switch}
          checked={values.schedule.enabled}
          defaultChecked={false}
          name="schedule.enabled"
          onChange={(value: boolean) => {
            setFieldValue('schedule.enabled', value);
          }}
        />
      </FormHeader>
      {values.logicalCheck.enabled ? (
        <>
          <FormRow>
            <label htmlFor="schedule-step-calendar">Start</label>
            <Dropdown
              appendTo={document.body}
              content={
                <Menu>
                  <Field
                    as={Calendar}
                    color={Colors['midblue-3'].hex()}
                    date={scheduleStart.date}
                    onChange={(date: Date) => {
                      setScheduleStart({ date });
                      setIsCalendarVisible(false);
                    }}
                  />
                </Menu>
              }
              visible={isCalendarVisible}
              onClickOutside={() => {
                closeCalendar();
              }}
            >
              <Input
                icon="Calendar"
                id="schedule-step-calendar"
                type="text"
                value={scheduleStart.dateString}
                readOnly
                onClick={() => {
                  setIsCalendarVisible(true);
                }}
              />
            </Dropdown>
            <Field
              as={Input}
              icon="Clock"
              name="schedule.start"
              type="time"
              value={scheduleStart.timeString}
              onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
                setScheduleStart({ timeString: event.currentTarget.value });
              }}
            />
          </FormRow>
          <FormRow>
            <label htmlFor="schedule-step-repeat">Repeat every</label>
            <NumberField
              id="schedule-step-repeat"
              max={86400}
              min={1}
              name="schedule.repeat"
              setValue={(count: number) => {
                setScheduleRepeat({ count });
              }}
              width={120}
            />
            <Field
              as={Select}
              name="schedule.repeat"
              options={intervalOptions}
              value={scheduleRepeat.intervalOption}
              closeMenuOnSelect
              onChange={({
                value: interval = intervalOptions[0].value,
              }: OptionType<string>) => {
                setScheduleRepeat({ interval });
              }}
            />
          </FormRow>
        </>
      ) : null}
    </FormContainer>
  );
}

interface ScheduleStart {
  date: Date;
  dateString: string;
  timeString: string;
}

interface ScheduleRepeat {
  count: number;
  interval: string;
  intervalOption?: ValueOptionType<string>;
}

type ValueOptionType<T> = OptionType<T> &
  Required<Pick<OptionType<T>, 'value'>>;

const intervalOptions: ValueOptionType<string>[] = [
  { label: 'minutes', value: 'm' },
  { label: 'hours', value: 'h' },
  { label: 'days', value: 'd' },
];
