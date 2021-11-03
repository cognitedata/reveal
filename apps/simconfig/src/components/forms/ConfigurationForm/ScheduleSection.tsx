import { Input } from '@cognite/cogs.js';
import moment from 'moment';
import { Field, useFormikContext } from 'formik';
import {
  InputArea,
  InputAreaSwitch,
  InputRow,
  SectionTitle,
} from 'components/forms/elements';
import ValidationWindowInput from 'components/forms/controls/ValidationWindowInput';

import { CalculationConfig } from './types';

export function ScheduleSection() {
  const { values, setFieldValue } = useFormikContext<CalculationConfig>();

  const datetime = moment(values.schedule?.start).format('YYYY-MM-DDTHH:mm:ss');

  const onDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFieldValue('schedule.start', moment(e.target.value).utc().valueOf());
  };

  return (
    <>
      <SectionTitle level={2}>
        SCHEDULE
        <InputAreaSwitch
          value={values.schedule?.enabled}
          name="schedule.enabled"
          disabled
          onChange={(value: boolean) =>
            setFieldValue('schedule.enabled', value)
          }
        />
      </SectionTitle>

      <InputArea>
        <InputRow>
          <Field
            as={Input}
            value={datetime}
            title="Start"
            name="schedule.start"
            type="datetime-local"
            onChange={onDateChange}
            disabled
          />
          <ValidationWindowInput
            title="Repeat every"
            name="schedule.repeat"
            disabled
            type="number"
          />
        </InputRow>
      </InputArea>
    </>
  );
}
