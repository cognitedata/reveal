import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { createLink } from '@cognite/cdf-utilities';
import {
  CANCEL,
  CREATE,
  DESCRIPTION_HINT,
  DESCRIPTION_LABEL,
  EXT_PIPE_NAME_HEADING,
  EXTERNAL_ID_HINT,
  EXTRACTION_PIPELINE_LOWER,
  INTEGRATION_EXTERNAL_ID_HEADING,
  NAME_HINT,
} from 'utils/constants';
import { RegisterIntegrationLayout } from 'components/layout/RegisterIntegrationLayout';
import { CreateFormWrapper } from 'styles/StyledForm';
import { ButtonPlaced } from 'styles/StyledButton';
import * as yup from 'yup';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useDataSet } from 'hooks/useDataSets';
import { FullInput } from 'components/inputs/FullInput';
import { usePostIntegration } from 'hooks/usePostIntegration';
import styled from 'styled-components';
import { Button, Colors, Modal } from '@cognite/cogs.js';
import { PriSecBtnWrapper } from 'styles/StyledWrapper';
import {
  descriptionRule,
  documentationRule,
  externalIdRule,
  nameRule,
  scheduleRule,
  selectedRawTablesRule,
  sourceRule,
} from 'utils/validation/integrationSchemas';
import DataSetIdInput, {
  DATASET_LIST_LIMIT,
} from 'pages/create/DataSetIdInput';
import { useDataSetsList } from 'hooks/useDataSetsList';
import { ScheduleFormInput } from 'components/integration/edit/Schedule';
import { createExtPipePath } from 'utils/baseURL';
import { EXT_PIPE_PATH } from 'routing/RoutingConfig';
import { translateServerErrorMessage } from 'utils/error/TranslateErrorMessages';
import { IntegrationRawTable } from 'model/Integration';
import { contactsRule } from 'utils/validation/contactsSchema';
import { User } from 'model/User';
import { InfoIcon } from 'styles/StyledIcon';
import { createAddIntegrationInfo } from 'utils/integrationUtils';
import { EXTPIPES_WRITES } from 'model/AclAction';
import { CapabilityCheck } from 'components/accessCheck/CapabilityCheck';
import { ids } from 'cogs-variables';
import { trackUsage } from 'utils/Metrics';

const InfoMessage = styled.span`
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
const NO_DATA_SET_MSG: Readonly<string> = `No data set found. You can link your ${EXTRACTION_PIPELINE_LOWER} to a data set trough edit later.`;

export interface AddIntegrationFormInput
  extends ScheduleFormInput,
    FieldValues {
  name: string;
  externalId: string;
  description?: string;
  dataSetId?: number;
  metadata?: any;
  source: string;
  contacts?: User[];
  documentation: string;
  selectedRawTables: IntegrationRawTable[];
}
const pageSchema = yup.object().shape({
  ...nameRule,
  ...externalIdRule,
  ...descriptionRule,
  ...contactsRule,
  ...scheduleRule,
  ...sourceRule,
  ...selectedRawTablesRule,
  ...documentationRule,
});

const findDataSetId = (search: string) => {
  return new URLSearchParams(search).get('dataSetId');
};

const CustomLabel = styled.label<{ required: boolean }>`
  font-size: 1.1rem;
  font-weight: 500;
  display: block;
  padding: 3px 0;

  &::after {
    content: ' *';
    color: red;
    visibility: ${(props) => (props.required ? 'visible' : 'hidden')};
  }
`;

export const CreateIntegration = (props: {
  customCancelCallback?: () => void;
}) => {
  const [dataSetLoadError, setDataSetLoadError] = useState<string | null>(null);
  const history = useHistory();
  const location = useLocation();
  const { search } = location;
  const dataSetId = findDataSetId(search) ?? '';
  const { data: dataSet, isLoading, error: dataSetError } = useDataSet(
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
      documentation: '',
      contacts: [],
    },
    reValidateMode: 'onSubmit',
  });
  const {
    control,
    formState: { errors },
    setError,
    handleSubmit,
    register,
  } = methods;

  useEffect(() => {
    if (dataSetError) {
      setDataSetLoadError(dataSetError.errors[0].missing && NO_DATA_SET_MSG);
    }
  }, [dataSetError, setDataSetLoadError]);
  useEffect(() => {
    if (isLoading) {
      setDataSetLoadError(null);
    }
  }, [isLoading, setDataSetLoadError]);
  useEffect(() => {
    register('dataSetId');
  }, [register]);

  const onSubmit = (fields: AddIntegrationFormInput) => {
    const integrationInfo = createAddIntegrationInfo(fields, dataSet);
    trackUsage({ t: 'Create.Submit' });
    mutate(
      { integrationInfo },
      {
        onSuccess: (response) => {
          trackUsage({ t: 'Create.Completed' });
          const newIntegrationId = response.id;
          history.push(
            createExtPipePath(`/${EXT_PIPE_PATH}/${newIntegrationId}`)
          );
        },
        onError: (errorRes, variables) => {
          const serverErrorMessage = translateServerErrorMessage<AddIntegrationFormInput>(
            errorRes?.data,
            variables.integrationInfo
          );
          trackUsage({
            t: 'Create.Rejected',
            error: serverErrorMessage.message,
          });
          if (errorRes.duplicated != null) {
            errorRes.duplicated.forEach((errorObject) => {
              const [fieldName, fieldValue] = Object.entries(errorObject)[0];
              setError(
                fieldName,
                {
                  message: `'${fieldValue}' is already in use`,
                },
                { shouldFocus: true }
              );
            });
          } else {
            setError('server', {
              type: 'server',
              message: serverErrorMessage.message,
              shouldFocus: true,
            });
          }
        },
      }
    );
  };

  return (
    <>
      {dataSetLoadError && (
        <InfoMessage
          id="dataset-error"
          className="data-set-info"
          role="region"
          aria-live="polite"
          color={`${Colors.yellow.hex()}`}
        >
          <InfoIcon />
          {dataSetLoadError}
        </InfoMessage>
      )}
      <FormProvider {...methods}>
        <CreateFormWrapper onSubmit={handleSubmit(onSubmit)}>
          {errors.server ? (
            <InfoMessage
              id="dataset-data"
              className="data-set-info"
              role="region"
              aria-live="polite"
            >
              <InfoIcon />
              <p>{errors.server.message}</p>
            </InfoMessage>
          ) : null}
          {!dataSetId && (
            <DataSetIdInput
              data={dataSets}
              status={dataSetsStatus}
              renderLabel={(labelText, inputId) => (
                <CustomLabel required htmlFor={inputId}>
                  {labelText}
                </CustomLabel>
              )}
            />
          )}
          <div style={{ height: '1rem' }} />
          <FullInput
            name="name"
            inputId="integration-name"
            defaultValue=""
            control={control as any}
            errors={errors}
            labelText={EXT_PIPE_NAME_HEADING}
            hintText={NAME_HINT}
            renderLabel={(labelText, inputId) => (
              <CustomLabel required htmlFor={inputId}>
                {labelText}
              </CustomLabel>
            )}
          />
          <FullInput
            name="externalId"
            inputId="integration-external-id"
            defaultValue=""
            control={control as any}
            errors={errors}
            labelText={INTEGRATION_EXTERNAL_ID_HEADING}
            hintText={EXTERNAL_ID_HINT}
            renderLabel={(labelText, inputId) => (
              <CustomLabel required htmlFor={inputId}>
                {labelText}
              </CustomLabel>
            )}
          />
          <FullInput
            name="description"
            control={control as any}
            defaultValue=""
            labelText={DESCRIPTION_LABEL}
            hintText={DESCRIPTION_HINT}
            inputId="integration-description"
            errors={errors}
            renderLabel={(labelText, inputId) => (
              <CustomLabel required={false} htmlFor={inputId}>
                {labelText}
              </CustomLabel>
            )}
          />
          <PriSecBtnWrapper>
            {props.customCancelCallback == null ? (
              <a
                href={createLink(
                  `/data-sets${dataSetId && `/data-set/${dataSetId}`}`
                )}
                className="cogs-btn cogs-btn-ghost cogs-btn-secondary cogs-btn--padding"
              >
                {CANCEL}
              </a>
            ) : (
              <Button type="ghost" onClick={props.customCancelCallback}>
                {CANCEL}
              </Button>
            )}
            <ButtonPlaced type="primary" htmlType="submit" marginbottom={0}>
              {CREATE}
            </ButtonPlaced>
          </PriSecBtnWrapper>
        </CreateFormWrapper>
      </FormProvider>
    </>
  );
};

export default function CreateIntegrationPage() {
  useEffect(() => {
    trackUsage({ t: 'Create.CreatePageLoaded' });
  }, []);
  return (
    <RegisterIntegrationLayout>
      <CapabilityCheck requiredPermissions={EXTPIPES_WRITES}>
        <Modal
          visible
          width={600}
          closable={false}
          closeIcon={false}
          appElement={document.getElementsByClassName(ids.styleScope).item(0)!}
          getContainer={() =>
            document.getElementsByClassName(ids.styleScope).item(0) as any
          }
          footer={null}
          title="Create extraction pipeline"
        >
          <CreateIntegration />
        </Modal>
      </CapabilityCheck>
    </RegisterIntegrationLayout>
  );
}
