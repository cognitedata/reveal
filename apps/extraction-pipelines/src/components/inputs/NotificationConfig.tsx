import { Checkbox } from '@cognite/cogs.js';
import React, { FunctionComponent, PropsWithoutRef } from 'react';
import {
  Controller,
  ControllerRenderProps,
  useFormContext,
} from 'react-hook-form';
import { DivFlex } from 'styles/flex/StyledFlex';
import styled from 'styled-components';
import { InputController } from 'components/inputs/InputController';
import { Hint, StyledLabel } from 'styles/StyledForm';
import ValidationError from 'components/form/ValidationError';
import { EXTRACTION_PIPELINE_LOWER } from 'utils/constants';

export const HourWrapper = styled(DivFlex)`
  #skipNotificationInHours {
    width: 3.5rem;
  }
  span {
    margin-left: 0.5rem;
    margin-right: 0.5rem;
  }
`;

export const NOTIFICATION_CONFIG_HEADER: Readonly<string> =
  'Notification configuration';
export const CONFIG_HINT: Readonly<string> = `The ${EXTRACTION_PIPELINE_LOWER} will send a notification to all subscribed contacts on every failure if not configured`;
export const CONFIG_LABEL: Readonly<string> =
  'Configure notification pause time period';
export const HOURS_LABEL: Readonly<string> =
  'Number of hours to pause sending notifications';
export const HOURS_HINT: Readonly<string> =
  'Allowed pause time is between 1 and 24 hours';

export interface NotificationFormInput {
  skipNotificationInHours: number;
  hasConfig: boolean;
}
interface NotificationConfigProps {
  renderLabel?: (labelText: string, inputId: string) => React.ReactNode;
}

export const NotificationConfig: FunctionComponent<NotificationConfigProps> = ({
  renderLabel = (labelText, inputId) => (
    <StyledLabel htmlFor={inputId}>{labelText}</StyledLabel>
  ),
}: PropsWithoutRef<NotificationConfigProps>) => {
  const { errors, watch, control } = useFormContext();
  const hasConfig = watch('hasConfig');

  return (
    <>
      {renderLabel(NOTIFICATION_CONFIG_HEADER, 'in')}
      <Hint id="has-config-hint">{CONFIG_HINT}</Hint>
      <Controller
        name="hasConfig"
        control={control}
        defaultValue={false}
        render={({
          onChange,
          value,
        }: ControllerRenderProps<Pick<NotificationFormInput, 'hasConfig'>>) => (
          <Checkbox
            id="has-config"
            name="hasConfig"
            value={value}
            onChange={onChange}
            aria-describedby="has-config-hint"
          >
            {CONFIG_LABEL}
          </Checkbox>
        )}
      />

      {hasConfig && (
        <DivFlex direction="column" align="flex-start" id="data-set-id-wrapper">
          <StyledLabel htmlFor="skipNotificationInHours">
            {HOURS_LABEL}
          </StyledLabel>
          <Hint id="skip-notification-in-hours-hint">{HOURS_HINT}</Hint>
          <ValidationError
            errors={errors}
            name="skipNotificationInHours"
            id="skipNotificationInHours-error"
          />
          <HourWrapper>
            <InputController
              name="skipNotificationInHours"
              control={control}
              inputId="skipNotificationInHours"
              defaultValue=""
              aria-invalid={!!errors.skipNotificationInHours}
              aria-describedby="skip-notification-in-hours-hint skipNotificationInHours-error"
            />
            <span className="bottom-spacing">hours</span>
          </HourWrapper>
        </DivFlex>
      )}
    </>
  );
};
