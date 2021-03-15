import { Checkbox, Input } from '@cognite/cogs.js';
import React, { FunctionComponent } from 'react';
import {
  Controller,
  ControllerRenderProps,
  useFormContext,
} from 'react-hook-form';
import { DivFlex } from 'styles/flex/StyledFlex';
import styled from 'styled-components';
import { GridH2Wrapper } from 'styles/StyledPage';
import { ErrorMessage } from '@hookform/error-message';
import { ContactsFormInput } from 'pages/create/ContactsPage';

const HourWrapper = styled(DivFlex)`
  .cogs-input {
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

interface NotificationConfigProps {}

export const NotificationConfig: FunctionComponent<NotificationConfigProps> = () => {
  const { errors, watch, control } = useFormContext();
  const hasConfig = watch('hasConfig');

  return (
    <>
      <GridH2Wrapper>{NOTIFICATION_CONFIG_HEADER}</GridH2Wrapper>
      <span id="has-config-hint" className="input-hint">
        {CONFIG_HINT}
      </span>
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
          <label htmlFor="skipNotificationInHours" className="input-label">
            {HOURS_LABEL}
          </label>
          <span id="skip-notification-in-hours-hint" className="input-hint">
            {HOURS_HINT}
          </span>
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
            <Controller
              name="skipNotificationInHours"
              control={control}
              defaultValue=""
              render={({
                onChange,
                value,
              }: ControllerRenderProps<
                Pick<ContactsFormInput, 'skipNotificationInHours'>
              >) => (
                <Input
                  id="skipNotificationInHours"
                  type="number"
                  value={value}
                  onChange={onChange}
                  aria-describedby="skip-notification-in-hours-hint skipNotificationInHours-error"
                />
              )}
            />
            <span>hours</span>
          </HourWrapper>
        </DivFlex>
      )}
    </>
  );
};
