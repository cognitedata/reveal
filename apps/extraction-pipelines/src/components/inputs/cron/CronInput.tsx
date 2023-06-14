import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { parseCron } from '@extraction-pipelines/utils/cronUtils';
import { Link } from '@extraction-pipelines/components/buttons/Link';
import { InputController } from '@extraction-pipelines/components/inputs/InputController';
import { Hint, StyledLabel } from '@extraction-pipelines/components/styled';
import ValidationError from '@extraction-pipelines/components/form/ValidationError';
import { CRON_LINK } from '@extraction-pipelines/utils/constants';
import { useTranslation } from '@extraction-pipelines/common';

interface CronPageProps {}

const CronInput: FunctionComponent<CronPageProps> = () => {
  const { t } = useTranslation();
  const {
    formState: { errors },
    control,
    watch,
  } = useFormContext();
  const i = watch('cron');
  const readCron = (exp: string) => {
    try {
      const parsed = parseCron(exp);
      return <ReadBack>{parsed}</ReadBack>;
    } catch (_) {
      return <></>;
    }
  };
  return (
    <>
      <StyledLabel htmlFor="cron-input" data-testid="cron-title">
        {t('cron-title')}
      </StyledLabel>
      <StyledHint id="cron-hint">
        <p data-testid="cron-info">{t('cron-info')}</p>
        <Link href={CRON_LINK} linkText={t('cron-learn-more')} />
      </StyledHint>
      <ValidationError id="cron-error" errors={errors} name="cron" />
      <InputController
        name="cron"
        control={control}
        inputId="cron-input"
        defaultValue=""
        aria-invalid={!!errors.cron}
        aria-describedby="cron-hint cron-error"
        data-testid="cron-title-input"
      />
      {readCron(i)}
    </>
  );
};

const ReadBack = styled.i`
  margin-bottom: 1rem;
`;

const StyledHint = styled(Hint)`
  margin-bottom: 0;
  p {
    margin-bottom: 0;
  }
`;

export default CronInput;
