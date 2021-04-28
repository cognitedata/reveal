import { Checkbox } from '@cognite/cogs.js';
import React, { FunctionComponent, PropsWithoutRef } from 'react';
import {
  Controller,
  ControllerRenderProps,
  useFormContext,
} from 'react-hook-form';
import { DivFlex } from 'styles/flex/StyledFlex';
import styled from 'styled-components';
import { ErrorMessage } from '@hookform/error-message';
import { ContactsFormInput } from 'pages/create/ContactsPage';
import { InputController } from 'components/inputs/InputController';
import { Hint, StyledLabel } from 'styles/StyledForm';

const HourWrapper = styled(DivFlex)`
  #skipNotificationInHours {
    width: 3.5rem;
  }
  span {
    margin-left: 0.5rem;
  }
`;

export const NOTIFICATION_CONFIG_HEADER: Readonly<string> =
  'Notification configuration';
export const CONFIG_HINT: Readonly<string> =
  'The integration will send a notification to all subscribed contacts on every failure if not configured';
export const CONFIG_LABEL: Readonly<string> =
  'Configure notification pause time period';
export const HOURS_LABEL: Readonly<string> =
  'Enter number of hours to pause sending notifications';
export const HOURS_HINT: Readonly<string> =
  'Allowed pause time is between 1 and 24 hours';

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
        }: ControllerRenderProps<Pick<ContactsFormInput, 'hasConfig'>>) => (
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
          <ErrorMessage
            errors={errors}
            name="skipNotificationInHours"
            render={({ message }) => (
              <span
                id="skipNotificationInHours-error"
                className="error-message"
              >
                {message}
              </span>
            )}
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
