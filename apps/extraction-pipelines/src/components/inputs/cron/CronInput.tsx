import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { parseCron } from 'utils/cronUtils';
import { Link } from 'components/buttons/Link';
import { InputController } from 'components/inputs/InputController';
import { Hint, StyledLabel } from 'components/styled';
import ValidationError from 'components/form/ValidationError';
import { EXTRACTION_PIPELINE_LOWER } from 'utils/constants';

const ReadBack = styled.i`
  margin-bottom: 1rem;
`;
const StyledHint = styled(Hint)`
  margin-bottom: 0;
  p {
    margin-bottom: 0;
  }
`;
export const CRON_LABEL: Readonly<string> = 'Cron expression';
export const CRON_TIP: Readonly<string> = `Enter a cron expression for when the ${EXTRACTION_PIPELINE_LOWER} is scheduled to run.`;

interface CronPageProps {}

const CronInput: FunctionComponent<CronPageProps> = () => {
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
      <StyledLabel htmlFor="cron-input">{CRON_LABEL}</StyledLabel>
      <StyledHint id="cron-hint">
        <p>{CRON_TIP}</p>
        <Link
          href="https://crontab.guru/"
          linkText="How do I write a cron expression?"
        />
      </StyledHint>
      <ValidationError id="cron-error" errors={errors} name="cron" />
      <InputController
        name="cron"
        control={control}
        inputId="cron-input"
        defaultValue=""
        aria-invalid={!!errors.cron}
        aria-describedby="cron-hint cron-error"
      />
      {readCron(i)}
    </>
  );
};
export default CronInput;
