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
import styled from 'styled-components';
import { DivFlex } from 'styles/flex/StyledFlex';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  mapModelToInput,
  mapScheduleInputToScheduleValue,
} from 'utils/cronUtils';
import MessageDialog from 'components/buttons/MessageDialog';
import {
  ContactBtnTestIds,
  INTEGRATION_SCHEDULE_HINT,
  SERVER_ERROR_CONTENT,
  SERVER_ERROR_TITLE,
} from 'utils/constants';
import { Integration, IntegrationFieldName } from 'model/Integration';
import { useAppEnv } from 'hooks/useAppEnv';
import {
  createUpdateSpec,
  useDetailsUpdate,
} from 'hooks/details/useDetailsUpdate';
import { ColumnForm, Hint, StyledLabel } from 'styles/StyledForm';
import { scheduleSchema } from 'utils/validation/integrationSchemas';
import { ScheduleSelector } from 'components/inputs/ScheduleSelector';
import { OptionTypeBase } from 'react-select';
import { CloseButton, EditButton, SaveButton } from 'styles/StyledButton';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { AddFieldInfoText } from 'components/message/AddFieldInfoText';
import { NoDataAdded } from 'components/buttons/AddFieldValueBtn';

export const CronWrapper = styled(DivFlex)`
  margin: 1rem 0 1rem 2rem;
  padding: 1rem 0;
  border-top: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
  border-bottom: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
  label {
    margin-left: 0;
  }
`;
const ScheduleWrapper = styled(DivFlex)`
  display: grid;
  grid-template-areas: 'select btns' 'cron cron';
  grid-template-columns: 1fr auto;
  .cogs-select {
    grid-area: select;
  }
  #cron-expression {
    grid-area: cron;
  }
`;
const ButtonWrapper = styled.div`
  grid-area: btns;
  display: flex;
  justify-content: flex-end;
`;

export interface ScheduleFormInput {
  schedule: string;
  cron: string;
}

interface ScheduleProps {
  integration: Integration;
  name: IntegrationFieldName;
  label: string;
  canEdit: boolean;
}

const HintStyled = styled(Hint)`
  margin-left: 1rem;
`;

export const Schedule: FunctionComponent<ScheduleProps> = ({
  integration,
  name,
  label,
  canEdit,
}: PropsWithChildren<ScheduleProps>) => {
  const [showCron, setShowCron] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [errorVisible, setErrorVisible] = useState(false);
  const { project } = useAppEnv();
  const { mutate } = useDetailsUpdate();
  const { schedule } = integration;
  const methods = useForm<ScheduleFormInput>({
    resolver: yupResolver(scheduleSchema),
    defaultValues: mapModelToInput(integration?.schedule),
    reValidateMode: 'onSubmit',
  });
  const { register, handleSubmit, watch, setValue } = methods;
  const scheduleValue = watch('schedule');

  useEffect(() => {
    register('schedule');
  }, [register]);

  useEffect(() => {
    if (scheduleValue === SupportedScheduleStrings.SCHEDULED) {
      setShowCron(true);
    } else {
      setShowCron(false);
    }
  }, [scheduleValue]);

  const onSave = async (field: ScheduleFormInput) => {
    if (integration && project) {
      const updatedSchedule = mapScheduleInputToScheduleValue(field);
      const items = createUpdateSpec({
        project,
        id: integration.id,
        fieldValue: updatedSchedule,
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
    if (canEdit) {
      setIsEdit(true);
    }
  };

  const handleClickError = () => {
    setErrorVisible(false);
  };

  const onCancel = () => {
    setIsEdit(false);
  };

  const selectChanged = (selected: OptionTypeBase) => {
    setValue('schedule', selected.value);
  };

  const whenNotEditing = () => {
    if (!canEdit) {
      return schedule == null ? (
        <NoDataAdded>No schedule set</NoDataAdded>
      ) : (
        <div css="padding: 0 1rem">
          <DisplaySchedule id="display-schedule" schedule={schedule} />
        </div>
      );
    }
    return (
      <EditButton
        onClick={onEditClick}
        disabled={!canEdit}
        title="Toggle edit row"
        aria-expanded={isEdit}
        aria-controls={name}
        data-testid={`${ContactBtnTestIds.EDIT_BTN}schedule`}
        $full
      >
        {!schedule ? (
          <AddFieldInfoText>
            {TableHeadings.SCHEDULE.toLowerCase()}
          </AddFieldInfoText>
        ) : (
          <DisplaySchedule id="display-schedule" schedule={schedule} />
        )}
      </EditButton>
    );
  };

  const whenEditing = (
    <>
      <HintStyled>{INTEGRATION_SCHEDULE_HINT}</HintStyled>
      <ScheduleWrapper>
        <ScheduleSelector
          inputId="schedule-selector"
          schedule={scheduleValue}
          onSelectChange={selectChanged}
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
        <ButtonWrapper>
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
        </ButtonWrapper>
      </ScheduleWrapper>
    </>
  );
  return (
    <FormProvider {...methods}>
      <ColumnForm onSubmit={handleSubmit(onSave)}>
        <StyledLabel htmlFor="schedule-selector">{label}</StyledLabel>
        {isEdit ? whenEditing : whenNotEditing()}
      </ColumnForm>
    </FormProvider>
  );
};
