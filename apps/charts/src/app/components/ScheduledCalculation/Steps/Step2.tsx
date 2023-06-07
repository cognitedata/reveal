import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { useTranslations } from '@charts-app/hooks/translations';
import { Flex, Button, Title } from '@cognite/cogs.js';
import { ScheduleClock } from '@charts-app/components/Icons/ScheduleClock';
import { useFormContext } from 'react-hook-form';
import FormError from '@charts-app/components/Form/FormError';
import { FormInputWithController } from '../../Form/FormInputWithController';
import { FlexGrow, Steps2Column } from './elements';
import { CalculationPreview } from './CalculationPreview';
import { ScheduleCalculationFieldValues } from '../../../domain/scheduled-calculation/internal/types';

const defaultTranslations = makeDefaultTranslations(
  'Save result and schedule the calculation',
  'Cancel',
  'Start schedule',
  'Name',
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

export const Step2Header = () => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'ScheduledCalculation')
      .t,
  };

  return (
    <Flex gap={8} alignItems="center">
      <ScheduleClock />
      <Title level={5}>{t['Save result and schedule the calculation']}</Title>
    </Flex>
  );
};

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
        <FormInputWithController type="unit" name="unit" title={t.Unit} />
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
