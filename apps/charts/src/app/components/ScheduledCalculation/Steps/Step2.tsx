import { useFormContext } from 'react-hook-form';

import FormError from '@charts-app/components/Form/FormError';
import { useTranslations } from '@charts-app/hooks/translations';
import { makeDefaultTranslations } from '@charts-app/utils/translations';

import { Flex, Button, Title } from '@cognite/cogs.js';

import { ScheduleCalculationFieldValues } from '../../../domain/scheduled-calculation/internal/types';
import { FormInputWithController } from '../../Form/FormInputWithController';

import { CalculationPreview } from './CalculationPreview';
import { FlexGrow, Steps2Column } from './elements';

const defaultTranslations = makeDefaultTranslations(
  'Cancel',
  'Start schedule',
  'Name',
  'Dataset',
  'Run every',
  'Description',
  'Unit',
  'Hour(s)',
  'Minute(s)',
  'Day',
  'Type',
  'Input',
  'Output',
  'Settings',
  'Result preview'
);

export const Step2Body = ({ workflowId }: { workflowId: string }) => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'ScheduledCalculation')
      .t,
  };

  const {
    formState: { isValid, isDirty, errors },
    watch,
  } = useFormContext<ScheduleCalculationFieldValues>();

  const formValues = watch();
  const {
    period,
    periodType: { value: periodTypeUnit },
  } = formValues;

  return (
    <Flex gap={28} alignItems="stretch">
      <Steps2Column direction="column">
        <Title level={6}>{t.Settings}</Title>
        <FlexGrow>
          <FormInputWithController
            type="text"
            name="name"
            title={t.Name}
            required="Name is required"
            placeholder="Enter the name for scheduled calculation"
            autoFocus
          />
        </FlexGrow>
        <Flex alignItems="end" gap={8}>
          <FlexGrow>
            <FormInputWithController
              type="number"
              name="period"
              title={t['Run every']}
              max={0}
            />
          </FlexGrow>
          <FlexGrow>
            <FormInputWithController
              type="select"
              name="periodType"
              options={[
                { value: 'minutes', label: t['Minute(s)'] },
                { value: 'hours', label: t['Hour(s)'] },
                { value: 'days', label: t.Day },
              ]}
            />
          </FlexGrow>
        </Flex>

        <FormInputWithController
          type="textarea"
          name="description"
          title={t.Description}
        />
        <div style={{ marginBottom: '1rem' }}>
          <FormInputWithController type="unit" name="unit" title={t.Unit} />
        </div>

        <FormInputWithController
          type="dataset"
          name="dataset"
          title={t.Dataset}
        />
        {isDirty && !isValid && (
          <FormError<ScheduleCalculationFieldValues> errors={errors} />
        )}
      </Steps2Column>
      <Steps2Column direction="column">
        <Title level={6}>{t['Result preview']}</Title>
        <CalculationPreview
          workflowId={workflowId}
          period={{ length: period, type: periodTypeUnit! }}
        />
      </Steps2Column>
    </Flex>
  );
};

type FooterProps = {
  onNext: () => void;
  onCancel: () => void;
  loading: boolean;
};

export const Step2Footer = ({ onNext, onCancel, loading }: FooterProps) => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'ScheduledCalculation')
      .t,
  };

  return (
    <Flex alignItems="center" justifyContent="end" gap={8}>
      <Button onClick={onCancel} type="ghost">
        {t.Cancel}
      </Button>
      <Button onClick={onNext} type="primary" loading={loading}>
        {t['Start schedule']}
      </Button>
    </Flex>
  );
};
