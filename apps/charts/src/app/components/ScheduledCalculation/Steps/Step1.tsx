import { Flex, Button } from '@cognite/cogs.js';

import { useTranslations } from '../../../hooks/translations';
import { makeDefaultTranslations } from '../../../utils/translations';
import { CredentialsForm } from '../../CredentialsForm/CredentialsForm';

type BodyProps = {
  onUpdateCredsValidated: (validated: boolean) => void;
};

type FooterProps = {
  onNext: () => void;
  onCancel: () => void;
  isNextDisabled: boolean;
};

const defaultTranslations = makeDefaultTranslations('Cancel', 'Next');

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
