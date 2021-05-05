import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import { CANCEL, SAVE, SOURCE_HINT } from 'utils/constants';
import { RegisterIntegrationLayout } from 'components/layout/RegisterIntegrationLayout';
import { CreateFormWrapper } from 'styles/StyledForm';
import { ButtonPlaced } from 'styles/StyledButton';
import * as yup from 'yup';
import { FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { INTEGRATION_NAME_HEADING, NAME_HINT } from 'pages/create/NamePage';
import {
  EXTERNAL_ID_HINT,
  externalIdRule,
  INTEGRATION_EXTERNAL_ID_HEADING,
} from 'pages/create/ExternalIdPage';
import { useDataSet } from 'hooks/useDataSets';
import { FullInput } from 'components/inputs/FullInput';
import { FullTextArea } from 'components/inputs/FullTextArea';
import { usePostIntegration } from 'hooks/usePostIntegration';
import {
  DESCRIPTION_HINT,
  DESCRIPTION_LABEL,
  descriptionRule,
} from 'pages/create/DocumentationPage';
import { GridH2Wrapper, SideInfo } from 'styles/StyledPage';
import ExtractorDownloadsLink from 'components/links/ExtractorDownloadsLink';
import styled from 'styled-components';
import { Collapse, Colors } from '@cognite/cogs.js';
import { PriSecBtnWrapper } from 'styles/StyledWrapper';
import { DataSetModel } from 'model/DataSetModel';
import {
  nameRule,
  scheduleRule,
  selectedRawTablesRule,
  sourceRule,
} from 'utils/validation/integrationSchemas';
import DataSetIdInput, {
  DATASET_LIST_LIMIT,
} from 'pages/create/DataSetIdInput';
import { useDataSetsList } from 'hooks/useDataSetsList';
import { RegisterMetaData } from 'components/inputs/metadata/RegisterMetaData';
import { toCamelCase } from 'utils/primitivesUtils';
import { DivFlex } from 'styles/flex/StyledFlex';
import { ScheduleSelector } from 'components/inputs/ScheduleSelector';
import CronInput from 'components/inputs/cron/CronInput';
import { CronWrapper } from 'components/integration/edit/Schedule';
import { OptionTypeBase } from 'react-select';
import { SupportedScheduleStrings } from 'components/integrations/cols/Schedule';
import { ScheduleFormInput } from 'pages/create/SchedulePage';
import { mapScheduleInputToScheduleValue } from 'utils/cronUtils';
import { INTEGRATIONS } from 'utils/baseURL';
import { INTEGRATION } from 'routing/RoutingConfig';
import { translateServerErrorMessage } from 'utils/error/TranslateErrorMessages';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { DetailFieldNames } from 'model/Integration';
import { NotificationConfig } from 'components/inputs/NotificationConfig';
import { MIN_IN_HOURS } from 'utils/validation/notificationValidation';
import { contactsRule } from 'utils/validation/contactsSchema';
import { CreateContacts } from 'components/integration/create/CreateContacts';
import { User } from 'model/User';
import { HeadingLabel } from 'components/inputs/HeadingLabel';
import { InfoIcon } from 'styles/StyledIcon';
import { InfoBox } from 'components/message/InfoBox';
import ConnectRawTablesInput from 'components/inputs/rawSelector/ConnectRawTablesInput';
import { RawTableFormInput } from 'pages/create/RawTablePage';

const StyledCollapse = styled(Collapse)`
  background-color: red;
  .rc-collapse-item {
    .rc-collapse-header {
      padding-left: 0;
      padding-right: 0;
      border-bottom: none;
    }
    .rc-collapse-content {
      padding-left: 12px;
      padding-right: 0;
    }
  }
  .cogs-table-pagination {
    margin-bottom: 2rem;
    .cogs-input,
    .cogs-btn {
      margin-bottom: 0;
    }
  }
`;

const Panel = styled(Collapse.Panel)`
  .rc-collapse-content-box {
    display: flex;
    flex-direction: column;
  }
`;
const InfoMessage = styled.span`
  grid-area: description;
  display: flex;
  align-items: center;
  .cogs-icon {
    margin-right: 1rem;
    svg {
      g {
        path {
          &:nth-child(2),
          &:nth-child(3) {
            fill: ${(props: { color?: string }) =>
              props.color ?? `${Colors.primary.hex()}`};
          }
        }
      }
    }
  }
`;
const NO_DATA_SET_MSG: Readonly<string> =
  'No data set found. You can link your integration to a data set trough edit later.';
export const ADD_MORE_INFO_HEADING: Readonly<string> =
  'Add more integration information';
const ADD_MORE_INFO_TEXT_1: Readonly<string> =
  'When managing and using your data it would give value to enter as much information about the data and the integration details as possible, such as scheduling, source and contacts. Please enter this below.';
const ADD_MORE_INFO_TEXT_2: Readonly<string> =
  'You could also add this information on integration details page.';
const ADD_MORE_INFO_LINK: Readonly<string> =
  'Read about registering an integration';
const NOT_LINKED: Readonly<string> =
  'Integration will not be linked to data set. You can link your integration to a data set using edit later.';

const linkDataSetText = (dataSet: DataSetModel): Readonly<string> => {
  return `Integration will be linked to data set: ${dataSet.name} (${dataSet.id})`;
};
interface CreateIntegrationProps {}

interface AddIntegrationFormInput
  extends ScheduleFormInput,
    Pick<RawTableFormInput, 'selectedRawTables'> {
  name: string;
  externalId: string;
  description?: string;
  dataSetId?: number;
  metadata?: any;
  source: string;
  skipNotificationInHours?: number;
  contacts?: User[];
}
const pageSchema = yup.object().shape({
  ...nameRule,
  ...externalIdRule,
  ...descriptionRule,
  ...contactsRule,
  ...scheduleRule,
  ...sourceRule,
  ...selectedRawTablesRule,
});

const findDataSetId = (search: string) => {
  return new URLSearchParams(search).get('dataSetId');
};
const CreateIntegration: FunctionComponent<CreateIntegrationProps> = (
  _: PropsWithChildren<CreateIntegrationProps>
) => {
  const [dataSetLoadError, setDataSetLoadError] = useState<string | null>(null);
  const [showCron, setShowCron] = useState(false);
  const history = useHistory();
  const location = useLocation();
  const { search } = location;
  const dataSetId = findDataSetId(search) ?? '';
  const { data, isLoading, error } = useDataSet(
    parseInt(dataSetId, 10),
    dataSetLoadError ? 0 : 3
  );
  const { data: dataSets, status: dataSetsStatus } = useDataSetsList(
    DATASET_LIST_LIMIT
  );
  const { mutate } = usePostIntegration();
  const methods = useForm<AddIntegrationFormInput>({
    resolver: yupResolver(pageSchema),
    defaultValues: {
      name: '',
      externalId: '',
      description: '',
      dataSetId: parseInt(dataSetId, 10),
      selectedRawTables: [],
    },
    reValidateMode: 'onSubmit',
  });
  const {
    control,
    errors,
    setError,
    handleSubmit,
    register,
    watch,
    setValue,
  } = methods;

  useEffect(() => {
    if (error) {
      setDataSetLoadError(error.errors[0].missing && NO_DATA_SET_MSG);
    }
  }, [error, setDataSetLoadError]);
  useEffect(() => {
    if (isLoading) {
      setDataSetLoadError(null);
    }
  }, [isLoading, setDataSetLoadError]);
  useEffect(() => {
    register('schedule');
    register('dataSetId');
    register('selectedRawTables');
  }, [register]);
  const scheduleValue = watch('schedule');
  useEffect(() => {
    if (scheduleValue === SupportedScheduleStrings.SCHEDULED) {
      setShowCron(true);
    } else {
      setShowCron(false);
    }
  }, [scheduleValue]);

  const handleNext = (fields: AddIntegrationFormInput) => {
    function constructMetadata(
      metadata: {
        description: string;
        content: string;
      }[]
    ) {
      if (!metadata) {
        return null;
      }
      return metadata.map((field) => {
        const key = toCamelCase(field.description);
        return { [key]: field.content };
      });
    }

    const {
      source,
      schedule,
      cron,
      name,
      externalId,
      description,
      skipNotificationInHours,
      contacts,
      dataSetId: fieldDataSetId,
      selectedRawTables,
    } = fields;
    const metadata = constructMetadata(fields.metadata);
    const scheduleToStore = mapScheduleInputToScheduleValue({
      schedule,
      cron,
    });
    const integrationInfo = {
      name,
      externalId,
      ...(description && { description }),
      ...(data && { dataSetId: fieldDataSetId }),
      ...(source && { source }),
      ...(metadata && {
        metadata: Object.assign({}, ...metadata),
      }),
      ...(contacts && { contacts }),
      ...(!!scheduleToStore && { schedule: scheduleToStore }),
      ...(skipNotificationInHours && {
        skipNotificationsInMinutes: skipNotificationInHours * MIN_IN_HOURS,
      }),
      ...(selectedRawTables && { rawTables: selectedRawTables }),
    };
    mutate(
      { integrationInfo },
      {
        onSuccess: (response) => {
          const newIntegrationId = response.id;
          history.push(
            createLink(`/${INTEGRATIONS}/${INTEGRATION}/${newIntegrationId}`)
          );
        },
        onError: (errorRes, variables) => {
          const serverErrorMessage = translateServerErrorMessage<AddIntegrationFormInput>(
            errorRes?.data,
            variables.integrationInfo
          );
          setError(serverErrorMessage.field, {
            type: 'server',
            message: serverErrorMessage.message,
            shouldFocus: true,
          });
        },
      }
    );
  };

  const selectChanged = (selected: OptionTypeBase) => {
    setValue('schedule', selected.value);
  };

  return (
    <RegisterIntegrationLayout>
      {dataSetLoadError && (
        <InfoMessage
          id="dataset-error"
          role="region"
          aria-live="polite"
          color={`${Colors.yellow.hex()}`}
        >
          <InfoIcon />
          {dataSetLoadError}
        </InfoMessage>
      )}
      {data && (
        <InfoMessage id="dataset-data" role="region" aria-live="polite">
          <InfoIcon />
          {linkDataSetText(data[0])}
        </InfoMessage>
      )}
      {!dataSetId && (
        <InfoMessage id="dataset-data" role="region" aria-live="polite">
          <InfoIcon />
          {NOT_LINKED}
        </InfoMessage>
      )}
      <CreateFormWrapper onSubmit={handleSubmit(handleNext)}>
        <FullInput
          name="name"
          inputId="integration-name"
          defaultValue=""
          control={control}
          errors={errors}
          labelText={INTEGRATION_NAME_HEADING}
          hintText={NAME_HINT}
          renderLabel={(labelText, inputId) => (
            <HeadingLabel labelFor={inputId}>{labelText}</HeadingLabel>
          )}
        />
        <FullInput
          name="externalId"
          inputId="integration-external-id"
          defaultValue=""
          control={control}
          errors={errors}
          labelText={INTEGRATION_EXTERNAL_ID_HEADING}
          hintText={EXTERNAL_ID_HINT}
          renderLabel={(labelText, inputId) => (
            <HeadingLabel labelFor={inputId}>{labelText}</HeadingLabel>
          )}
        />
        <FullTextArea
          name="description"
          control={control}
          defaultValue=""
          labelText={DESCRIPTION_LABEL}
          hintText={DESCRIPTION_HINT}
          inputId="integration-description"
          errors={errors}
        />
        <PriSecBtnWrapper>
          <ButtonPlaced type="primary" htmlType="submit" mb={0}>
            {SAVE}
          </ButtonPlaced>
          <a
            href={createLink(
              `/data-sets${dataSetId && `/data-set/${dataSetId}`}`
            )}
            className="cogs-btn cogs-btn-secondary cogs-btn--padding"
          >
            {CANCEL}
          </a>
        </PriSecBtnWrapper>
        <InfoBox iconType="Info">
          <GridH2Wrapper>{ADD_MORE_INFO_HEADING}</GridH2Wrapper>
          <p className="box-content">{ADD_MORE_INFO_TEXT_1}</p>
          <p className="box-content">{ADD_MORE_INFO_TEXT_2}</p>
        </InfoBox>
        <StyledCollapse accordion ghost data-testid="add-more-info-collapse">
          <Panel
            header={
              <DivFlex direction="column" align="flex-start">
                <GridH2Wrapper>{ADD_MORE_INFO_HEADING}</GridH2Wrapper>
              </DivFlex>
            }
            key={1}
          >
            <FormProvider {...methods}>
              <CreateContacts
                renderLabel={(labelText, inputId) => (
                  <HeadingLabel labelFor={inputId}>{labelText}</HeadingLabel>
                )}
              />
              <NotificationConfig
                renderLabel={(labelText, inputId) => (
                  <HeadingLabel labelFor={inputId}>{labelText}</HeadingLabel>
                )}
              />
              <HeadingLabel labelFor="schedule-selector">
                {TableHeadings.SCHEDULE}
              </HeadingLabel>
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
              {!dataSetId && (
                <DataSetIdInput
                  data={dataSets}
                  status={dataSetsStatus}
                  renderLabel={(labelText, inputId) => (
                    <HeadingLabel labelFor={inputId}>{labelText}</HeadingLabel>
                  )}
                />
              )}
              <HeadingLabel labelFor="raw-table">
                {DetailFieldNames.RAW_TABLE}
              </HeadingLabel>
              <ConnectRawTablesInput />
              <FullInput
                name="source"
                inputId="source-input"
                defaultValue=""
                control={control}
                errors={errors}
                labelText={DetailFieldNames.SOURCE}
                hintText={SOURCE_HINT}
                renderLabel={(labelText, inputId) => (
                  <HeadingLabel labelFor={inputId}>{labelText}</HeadingLabel>
                )}
              />
              <RegisterMetaData />
              <ButtonPlaced type="primary" htmlType="submit" mb={5}>
                {SAVE}
              </ButtonPlaced>
            </FormProvider>
          </Panel>
        </StyledCollapse>
      </CreateFormWrapper>
      <SideInfo>
        <ExtractorDownloadsLink
          link={{ path: 'to' }}
          linkText={ADD_MORE_INFO_LINK}
        />
      </SideInfo>
    </RegisterIntegrationLayout>
  );
};
export default CreateIntegration;
