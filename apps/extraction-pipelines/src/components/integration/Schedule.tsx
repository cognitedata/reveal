import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { Colors } from '@cognite/cogs.js';
import DisplaySchedule, {
  SupportedScheduleStrings,
} from 'components/integrations/cols/Schedule';
import CronInput from 'components/inputs/cron/CronInput';
import { ScheduleFormInput } from 'pages/create/SchedulePage';
import styled from 'styled-components';
import { DivFlex } from 'styles/flex/StyledFlex';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  mapModelToInput,
  mapScheduleInputToScheduleValue,
} from 'utils/cronUtils';
import { ContactBtnTestIds } from 'components/form/ContactsView';
import MessageDialog from 'components/buttons/MessageDialog';
import { SERVER_ERROR_CONTENT, SERVER_ERROR_TITLE } from 'utils/constants';
import { Integration, IntegrationFieldName } from 'model/Integration';
import { useAppEnv } from 'hooks/useAppEnv';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { ColumnForm, StyledLabel } from 'styles/StyledForm';
import { scheduleSchema } from 'utils/validation/integrationSchemas';
import { ScheduleSelector } from 'components/inputs/ScheduleSelector';
import { OptionTypeBase } from 'react-select';
import { CloseButton, SaveButton, StyledEdit } from 'styles/StyledButton';

export const CronWrapper = styled(DivFlex)`
  margin: 1rem 0 1rem 2rem;
  padding: 1rem 0;
  border-top: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
  border-bottom: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
`;
const EditWrapper = styled(DivFlex)`
  .cogs-select {
    flex: 1;
  }
`;

interface ScheduleProps {
  integration: Integration;
  name: IntegrationFieldName;
  label: string;
}

export const Schedule: FunctionComponent<ScheduleProps> = ({
  integration,
  name,
  label,
}: PropsWithChildren<ScheduleProps>) => {
  const [showCron, setShowCron] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const methods = useForm<ScheduleFormInput>({
    resolver: yupResolver(scheduleSchema),
    defaultValues: mapModelToInput(integration?.schedule),
    reValidateMode: 'onSubmit',
  });
  const { register, handleSubmit, watch, setValue } = methods;
  useEffect(() => {
    register('schedule');
  }, [register]);
  const scheduleValue = watch('schedule');
  useEffect(() => {
    if (scheduleValue === SupportedScheduleStrings.SCHEDULED) {
      setShowCron(true);
    } else {
      setShowCron(false);
    }
  }, [scheduleValue]);

  const onSave = async (field: ScheduleFormInput) => {
    if (integration && project) {
      const schedule = mapScheduleInputToScheduleValue(field);
      const items = createUpdateSpec({
        project,
        id: integration.id,
        fieldValue: schedule,
        fieldName: 'schedule',
      });
      await mutate(items, {
        onError: () => {
          setErrorVisible(true);
        },
        onSuccess: () => {
          setIsEdit(false);
        },
      });
    }
  };

  const onEditClick = () => {
    setIsEdit(true);
  };

  function handleClickError() {
    setErrorVisible(false);
  }

  function onCancel() {
    setIsEdit(false);
  }
  const selectChanged = (selected: OptionTypeBase) => {
    setValue('schedule', selected.value);
  };
  return (
    <FormProvider {...methods}>
      <ColumnForm onSubmit={handleSubmit(onSave)}>
        <StyledLabel htmlFor="schedule-selector">{label}</StyledLabel>
        {isEdit ? (
          <EditWrapper>
            <ScheduleSelector
              inputId="schedule-selector"
              schedule={scheduleValue}
              onSelectChange={selectChanged}
              handleOnBlur={handleSubmit(onSave)}
            />
            {showCron && (
              <CronWrapper
                id="cron-expression"
                role="region"
                direction="column"
                align="flex-start"
              >
                <CronInput />
              </CronWrapper>
            )}
            <MessageDialog
              visible={errorVisible}
              handleClickError={handleClickError}
              title={SERVER_ERROR_TITLE}
              contentText={SERVER_ERROR_CONTENT}
            >
              <SaveButton
                htmlType="submit"
                aria-controls={name}
                data-testid={`${ContactBtnTestIds.SAVE_BTN}${name}`}
              />
            </MessageDialog>
            <CloseButton
              onClick={onCancel}
              aria-controls={name}
              data-testid={`${ContactBtnTestIds.CANCEL_BTN}${name}`}
            />
          </EditWrapper>
        ) : (
          <StyledEdit
            onClick={onEditClick}
            title="Toggle edit row"
            aria-expanded={isEdit}
            aria-controls={name}
            data-testid={`${ContactBtnTestIds.EDIT_BTN}schedule`}
            $full
          >
            <DisplaySchedule
              id="display-schedule"
              schedule={integration.schedule}
            />
            <span />
          </StyledEdit>
        )}
      </ColumnForm>
    </FormProvider>
  );
};
