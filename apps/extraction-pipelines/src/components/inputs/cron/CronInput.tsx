import React, { FunctionComponent, useState } from 'react';
import { Colors } from '@cognite/cogs.js';
import { useFormContext } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import styled from 'styled-components';
import { parseCron } from '../../../utils/cronUtils';
import { Link } from '../../buttons/Link';

const StyledInput = styled.input`
  width: 50%;
  margin-bottom: 0.5rem;
  &.has-error {
    border-color: ${Colors.danger.hex()};
  }
  &:focus {
    outline: -webkit-focus-ring-color auto 0.0625rem;
    outline-offset: 0.0625rem;
  }
`;
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
  const [input, setInput] = useState<string>('');
  const { register, errors } = useFormContext();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };
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
      <StyledInput
        id="cron-input"
        name="cron"
        type="text"
        onChange={onChange}
        ref={register}
        className={`cogs-input ${errors.cron ? 'has-error' : ''}`}
        aria-invalid={!!errors.cron}
        aria-describedby="cron-hint cron-error"
        autoComplete="off"
      />
      {readCron(input)}
    </>
  );
};
export default CronInput;
