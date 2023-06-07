import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { useTranslations } from '@charts-app/hooks/translations';
import { Flex, Button, Title } from '@cognite/cogs.js';
import { ScheduleClock } from '@charts-app/components/Icons/ScheduleClock';
import { CredentialsForm } from '@charts-app/components/CredentialsForm/CredentialsForm';

type BodyProps = {
  onUpdateCredsValidated: (validated: boolean) => void;
};

type FooterProps = {
  onNext: () => void;
  onCancel: () => void;
  isNextDisabled: boolean;
};

const defaultTranslations = makeDefaultTranslations(
  'Create scheduled calculation',
  'Cancel',
  'Next'
);

export const Step1Header = () => {
  const t = {
    ...defaultTranslations,
    ...useTranslations(Object.keys(defaultTranslations), 'ScheduledCalculation')
      .t,
  };

  return (
    <Flex gap={8} alignItems="center">
      <ScheduleClock />
      <Title level={5}>{t['Create scheduled calculation']}</Title>
    </Flex>
  );
};

export const Step1Body = ({ onUpdateCredsValidated }: BodyProps) => {
  return (
    <CredentialsForm
      onUpdateCredsValidated={onUpdateCredsValidated}
      uniqueFormId="scheduling"
      trackingId="ScheduledCalculation.LoginMethod"
    />
  );
};

export const Step1Footer = ({
  onNext,
  onCancel,
  isNextDisabled,
}: FooterProps) => {
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
      <Button
        disabled={isNextDisabled}
        onClick={onNext}
        type="primary"
        icon="ArrowRight"
        iconPlacement="right"
      >
        {t.Next}
      </Button>
    </Flex>
  );
};
