import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import {
  CANCEL,
  CREATE,
  DESCRIPTION_HINT,
  DESCRIPTION_LABEL,
  EXT_PIPE_NAME_HEADING,
  EXTERNAL_ID_HINT,
  EXTPIPE_EXTERNAL_ID_HEADING,
  NAME_HINT,
} from 'utils/constants';
import { RegisterExtpipeLayout } from 'components/layout/RegisterExtpipeLayout';
import { CreateFormWrapper } from 'styles/StyledForm';
import { ButtonPlaced } from 'styles/StyledButton';
import * as yup from 'yup';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FullInput } from 'components/inputs/FullInput';
import { usePostExtpipe } from 'hooks/usePostExtpipe';
import styled from 'styled-components';
import { Button, Colors, Modal } from '@cognite/cogs.js';
import { PriSecBtnWrapper } from 'styles/StyledWrapper';
import {
  dataSetIdRule,
  descriptionRule,
  externalIdRule,
  nameRule,
} from 'utils/validation/extpipeSchemas';
import DataSetIdInput, {
  DATASET_LIST_LIMIT,
} from 'pages/create/DataSetIdInput';
import { useDataSetsList } from 'hooks/useDataSetsList';
import { useUserInformation } from 'hooks/useUserInformation';
import { ScheduleFormInput } from 'components/extpipe/edit/Schedule';
import { createExtPipePath } from 'utils/baseURL';
import { EXT_PIPE_PATH } from 'routing/RoutingConfig';
import { translateServerErrorMessage } from 'utils/error/TranslateErrorMessages';
import { ExtpipeRawTable } from 'model/Extpipe';
import { User } from 'model/User';
import { InfoIcon } from 'styles/StyledIcon';
import { createAddExtpipeInfo } from 'utils/extpipeUtils';
import { EXTPIPES_WRITES } from 'model/AclAction';
import { CapabilityCheck } from 'components/accessCheck/CapabilityCheck';
import { ids } from 'cogs-variables';
import { trackUsage } from 'utils/Metrics';
import { createRedirectLink } from 'utils/utils';

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

export interface AddExtpipeFormInput extends ScheduleFormInput, FieldValues {
  name: string;
  externalId: string;
  description?: string;
  dataSetId?: number;
  metadata?: any;
  source: string;
  contacts?: User[];
  documentation: string;
  selectedRawTables: ExtpipeRawTable[];
}
const pageSchema = yup.object().shape({
  ...dataSetIdRule,
  ...nameRule,
  ...externalIdRule,
  ...descriptionRule,
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

export const CreateExtpipe = (props: { customCancelCallback?: () => void }) => {
  const history = useHistory();
  const location = useLocation();
  const dataSetIdFromLocation = findDataSetId(location.search);
  const { data: userInfo } = useUserInformation();
  const { data: dataSets, status: dataSetsStatus } = useDataSetsList(
    DATASET_LIST_LIMIT
  );
  const { mutate } = usePostExtpipe();
  const methods = useForm<AddExtpipeFormInput>({
    resolver: yupResolver(pageSchema),
    defaultValues: {
      name: '',
      externalId: '',
      description: '',
      dataSetId: dataSetIdFromLocation
        ? parseInt(dataSetIdFromLocation, 10)
        : undefined,
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
    register('dataSetId');
  }, [register]);

  const onSubmit = (fields: AddExtpipeFormInput) => {
    const extpipeInfo = createAddExtpipeInfo(fields, userInfo);
    trackUsage({ t: 'Create.Submit' });
    mutate(
      { extpipeInfo },
      {
        onSuccess: (response) => {
          trackUsage({ t: 'Create.Completed' });
          const newExtpipeId = response.id;
          history.push(createExtPipePath(`/${EXT_PIPE_PATH}/${newExtpipeId}`));
        },
        onError: (errorRes, variables) => {
          const serverErrorMessage = translateServerErrorMessage<AddExtpipeFormInput>(
            errorRes?.data,
            variables.extpipeInfo
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
          {dataSetIdFromLocation == null && (
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
            inputId="extpipe-name"
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
            inputId="extpipe-external-id"
            defaultValue=""
            control={control as any}
            errors={errors}
            labelText={EXTPIPE_EXTERNAL_ID_HEADING}
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
            inputId="extpipe-description"
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
                href={createRedirectLink(
                  `/data-sets${
                    dataSetIdFromLocation &&
                    `/data-set/${dataSetIdFromLocation}`
                  }`
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

export default function CreateExtpipePage() {
  useEffect(() => {
    trackUsage({ t: 'Create.CreatePageLoaded' });
  }, []);
  return (
    <RegisterExtpipeLayout>
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
          <CreateExtpipe />
        </Modal>
      </CapabilityCheck>
    </RegisterExtpipeLayout>
  );
}
