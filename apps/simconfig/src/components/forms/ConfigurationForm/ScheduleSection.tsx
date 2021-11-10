import { Input } from '@cognite/cogs.js';
import moment from 'moment';
import { Field, useFormikContext } from 'formik';
import {
  ConfigurationEditButton,
  InputArea,
  InputAreaSwitch,
  InputRow,
  SectionTitle,
} from 'components/forms/elements';
import ValidationWindowInput from 'components/forms/controls/ValidationWindowInput';

import { CalculationConfig } from './types';

interface ComponentProps {
  isEditing: boolean;
  onEditClick: () => void;
}
export function ScheduleSection({
  isEditing,
  onEditClick,
}: React.PropsWithoutRef<ComponentProps>) {
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
            disabled={!isEditing}
          />
          <ValidationWindowInput
            title="Repeat every"
            name="schedule.repeat"
            disabled={!isEditing}
            type="number"
          />
          <ConfigurationEditButton
            aria-label={isEditing ? 'Save' : 'Edit'}
            type="primary"
            toggled={!isEditing}
            icon={isEditing ? 'Save' : 'Edit'}
            htmlType={isEditing ? 'button' : 'submit'}
            onClick={onEditClick}
          >
            {isEditing ? 'Save changes' : 'Edit Configuration'}
          </ConfigurationEditButton>
        </InputRow>
      </InputArea>
    </>
  );
}
