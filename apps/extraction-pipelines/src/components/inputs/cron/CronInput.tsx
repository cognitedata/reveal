import React, { FunctionComponent } from 'react';
import { useFormContext } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { parseCron } from 'utils/cronUtils';
import { Link } from 'components/buttons/Link';
import { InputController } from 'components/inputs/InputController';

const ReadBack = styled.i`
  margin-bottom: 1rem;
`;
const Hint = styled.span`
  p {
    margin-bottom: 0;
  }
`;
export const CRON_LABEL: Readonly<string> = 'Cron expression';
export const INTEGRATION_CRON_HEADING: Readonly<string> =
  'Integration schedule - Cron Expression';
export const CRON_TIP: Readonly<string> =
  'Enter a cron expression for when the integration is scheduled to run.';

interface CronPageProps {}

const CronInput: FunctionComponent<CronPageProps> = () => {
  const { errors, control, watch } = useFormContext();
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
      <label htmlFor="cron-input" className="input-label">
        {CRON_LABEL}
      </label>
      <Hint id="cron-hint" className="input-hint">
        <p>{CRON_TIP}</p>
        <Link
          href="https://crontab.guru/"
          linkText="How do I write a cron expression?"
        />
      </Hint>
      <ErrorMessage
        errors={errors}
        name="cron"
        render={({ message }) => (
          <span id="cron-error" className="error-message">
            {message}
          </span>
        )}
      />
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
