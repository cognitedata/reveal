import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import { Flex, Button, Title } from '@cognite/cogs.js';
import { ScheduleClock } from 'components/Icons/ScheduleClock';
// import UnitDropdown from 'components/UnitDropdown/UnitDropdown';
import { FormInputWithController } from '../../Form/FormInputWithController';
import { Step2FormContainer, FlexGrow } from './elements';

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
  'Output'
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

export const Step2Body = () => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'ScheduledCalculation')
      .t,
  };
  return (
    <Flex gap={8}>
      <Step2FormContainer direction="column">
        <FlexGrow>
          <FormInputWithController
            type="text"
            name="name"
            title={t.Name}
            required="Name is required"
            placeholder="Enter the name for scheduled calculation"
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
                { value: 'minute', label: t['Minute(s)'] },
                { value: 'hour', label: t['Hour(s)'] },
                { value: 'day', label: t.Day },
              ]}
            />
          </FlexGrow>
        </Flex>

        <FormInputWithController
          type="textarea"
          name="description"
          title={t.Description}
        />
        {/* <UnitDropdown
          onOverrideUnitClick={() => {}}
          onConversionUnitClick={() => {}}
          onCustomUnitLabelClick={() => {}}
          onResetUnitClick={() => {}}
          translations={t}
        /> */}
        <FormInputWithController
          type="select"
          name="unit"
          title={t.Unit}
          placeholder="Enter the description for your scheduled calculaiton"
          options={[{ value: 'percentage', label: '%' }]}
        />
      </Step2FormContainer>
      <Flex>Preview Placeholder</Flex>
    </Flex>
  );
};

type FooterProps = {
  onNext: () => void;
  onCancel: () => void;
};

export const Step2Footer = ({ onNext, onCancel }: FooterProps) => {
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
      <Button onClick={onNext} type="primary">
        {t['Start schedule']}
      </Button>
    </Flex>
  );
};
