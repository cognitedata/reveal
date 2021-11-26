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

interface ComponentProps {
  isEditing: boolean;
}
export function ScheduleSection({
  isEditing,
}: React.PropsWithoutRef<ComponentProps>) {
  const { values, setFieldValue } = useFormikContext<CalculationConfig>();

  const datetime = moment(values.schedule?.start).format('YYYY-MM-DDTHH:mm:ss');

  const enabledBySwitch = values.schedule?.enabled;

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
          disabled={!isEditing}
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
            disabled={!isEditing || !enabledBySwitch}
          />
          <ValidationWindowInput
            title="Repeat every"
            name="schedule.repeat"
            disabled={!isEditing || !enabledBySwitch}
            type="number"
          />
        </InputRow>
      </InputArea>
    </>
  );
}
