import { useMemo, useState } from 'react';
import { Calendar } from 'react-date-range';

import { getDate, getMonth, getYear, set } from 'date-fns';
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

import type { ScheduleRepeat, ScheduleStart } from '../types';
import {
  INTERVAL_OPTIONS,
  getScheduleRepeat,
  getScheduleStart,
} from '../utils';

export function ScheduleStep() {
  const closeCalendar = () => {
    setIsCalendarVisible(false);
  };

  const { values, setFieldValue } = useFormikContext<CalculationTemplate>();

  const [isCalendarVisible, setIsCalendarVisible] = useState(false);

  const scheduleRepeat = useMemo(
    () => getScheduleRepeat(values.schedule.repeat),
    [values.schedule.repeat]
  );

  const setScheduleRepeat = ({
    count = scheduleRepeat.count,
    interval = scheduleRepeat.interval,
  }: Partial<ScheduleRepeat>) => {
    setFieldValue('schedule.repeat', `${count}${interval}`);
  };

  const scheduleStart = useMemo(
    () => getScheduleStart(values.schedule.start),
    [values.schedule.start]
  );

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
      {values.schedule.enabled ? (
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
              min={1}
              name="schedule.repeat"
              setValue={(count: string) => {
                setScheduleRepeat({ count: +count });
              }}
              step={1}
              value={parseInt(values.schedule.repeat, 10)}
              width={120}
            />
            <Field
              as={Select}
              options={INTERVAL_OPTIONS}
              value={scheduleRepeat.intervalOption}
              closeMenuOnSelect
              onChange={({
                value: interval = INTERVAL_OPTIONS[0].value,
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
