import React, { FunctionComponent, useState } from 'react';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import {
  Controller,
  ControllerRenderProps,
  FormProvider,
  useForm,
} from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { skipNotificationRule } from 'utils/validation/notificationValidation';
import * as yup from 'yup';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useAppEnv } from 'hooks/useAppEnv';
import { useIntegrationById } from 'hooks/useIntegration';
import {
  CONFIG_HINT,
  CONFIG_LABEL,
  HOURS_HINT,
  HOURS_LABEL,
  HourWrapper,
  NOTIFICATION_CONFIG_HEADER,
  NotificationFormInput,
} from 'components/inputs/NotificationConfig';
import { CreateFormWrapper, Hint, StyledLabel } from 'styles/StyledForm';
import { CloseButton, SaveButton, EditButton } from 'styles/StyledButton';
import { Checkbox } from '@cognite/cogs.js';
import { DivFlex } from 'styles/flex/StyledFlex';
import { BtnTestIds, ERROR_NO_ID, SERVER_ERROR_TITLE } from 'utils/constants';
import { HeadingLabel } from 'components/inputs/HeadingLabel';
import MessageDialog from 'components/buttons/MessageDialog';
import { AddInfo } from 'components/integration/AddInfo';
import { hoursToMinutes, minutesToHours } from 'utils/integrationUtils';
import { InputError } from 'components/inputs/InputError';
import { bottomSpacing } from 'styles/StyledVariables';
import styled from 'styled-components';

const ConfigWrapper = styled(DivFlex)`
  margin-bottom: ${bottomSpacing};
`;
const pageSchema = yup.object().shape(skipNotificationRule);

interface FormInput {
  skipNotificationInHours: number;
  hasConfig: boolean;
  server: string;
}

export const EditNotification: FunctionComponent = () => {
  const { project } = useAppEnv();
  const [isEdit, setIsEdit] = useState(false);
  const { integration } = useSelectedIntegration();
  const { data: storedIntegration } = useIntegrationById(integration?.id);
  const { mutate } = useDetailsUpdate();
  const methods = useForm<FormInput>({
    resolver: yupResolver(pageSchema),
    defaultValues: {
      hasConfig: storedIntegration?.skipNotificationsInMinutes
        ? storedIntegration?.skipNotificationsInMinutes > 0
        : false,
    },
    reValidateMode: 'onSubmit',
  });
  const {
    errors,
    watch,
    handleSubmit,
    control,
    setError,
    clearErrors,
    setValue,
  } = methods;
  const hasConfig = watch('hasConfig');
  if (!storedIntegration || !project) {
    return null;
  }
  const onValid = async (fields: FormInput) => {
    if (storedIntegration?.id && project) {
      const items = createUpdateSpec({
        project,
        id: storedIntegration.id,
        fieldName: 'skipNotificationsInMinutes',
        fieldValue: hoursToMinutes(fields.skipNotificationInHours),
      });
      mutate(items, {
        onSuccess: () => {
          setIsEdit(false);
        },
        onError: (e) => {
          setError('server', {
            type: '',
            message: e.data.message,
            shouldFocus: true,
          });
        },
      });
    } else {
      setError('server', {
        type: 'No id',
        message: ERROR_NO_ID,
        shouldFocus: true,
      });
    }
  };

  const handleClickError = () => {
    clearErrors('server');
  };
  const toggleEdit = (showEdit: boolean) => {
    return () => {
      setIsEdit(showEdit);
    };
  };

  const handleChange = (next: boolean) => {
    setValue('hasConfig', next);
    if (!next) {
      const items = createUpdateSpec({
        project,
        id: storedIntegration.id,
        fieldName: 'skipNotificationsInMinutes',
        fieldValue: 0,
      });
      mutate(items, {
        onSuccess: () => {
          setIsEdit(false);
        },
        onError: (e) => {
          setError('server', {
            type: '',
            message: e.data.message,
            shouldFocus: true,
          });
        },
      });
    }
  };
  return (
    <FormProvider {...methods}>
      <CreateFormWrapper onSubmit={handleSubmit(onValid)}>
        <HeadingLabel labelFor="hasConfig">
          {NOTIFICATION_CONFIG_HEADER}
        </HeadingLabel>
        <Hint id="has-config-hint">{CONFIG_HINT}</Hint>
        <Controller
          name="hasConfig"
          control={control}
          defaultValue={hasConfig}
          render={({
            value,
          }: ControllerRenderProps<
            Pick<NotificationFormInput, 'hasConfig'>
          >) => {
            return (
              <Checkbox
                id="has-config"
                name="hasConfig"
                value={value}
                onChange={handleChange}
                aria-describedby="has-config-hint"
              >
                {CONFIG_LABEL}
              </Checkbox>
            );
          }}
        />

        {hasConfig && (
          <ConfigWrapper
            direction="column"
            align="flex-start"
            id="data-set-id-wrapper"
          >
            <StyledLabel htmlFor="skipNotificationInHours">
              {HOURS_LABEL}
            </StyledLabel>
            <Hint id="skip-notification-in-hours-hint">{HOURS_HINT}</Hint>
            <HourWrapper>
              {isEdit ? (
                <>
                  <InputError
                    name="skipNotificationInHours"
                    inputId="skipNotificationInHours"
                    control={control}
                    defaultValue={minutesToHours(
                      storedIntegration?.skipNotificationsInMinutes
                    )}
                    errors={errors}
                    labelText={HOURS_LABEL}
                  />
                  <span className="bottom-spacing">hours</span>
                  <MessageDialog
                    visible={!!errors.server}
                    handleClickError={handleClickError}
                    title={SERVER_ERROR_TITLE}
                    contentText={errors.server?.message}
                  >
                    <SaveButton
                      htmlType="submit"
                      aria-controls="skipNotificationInHours"
                      test-id={`${BtnTestIds.SAVE_BTN}skipNotificationInHours`}
                    />
                  </MessageDialog>
                  <CloseButton onClick={toggleEdit(false)} />
                </>
              ) : (
                <EditButton
                  onClick={toggleEdit(true)}
                  title="Toggle edit hours"
                  aria-expanded={isEdit}
                  aria-controls="skipNotificationInHours"
                  data-testid={`${BtnTestIds.EDIT_BTN}hours`}
                >
                  <AddInfo
                    fieldValue={storedIntegration?.skipNotificationsInMinutes}
                    fieldName="skipNotificationsInMinutes"
                    label="hours"
                  />
                </EditButton>
              )}
            </HourWrapper>
          </ConfigWrapper>
        )}
      </CreateFormWrapper>
    </FormProvider>
  );
};
