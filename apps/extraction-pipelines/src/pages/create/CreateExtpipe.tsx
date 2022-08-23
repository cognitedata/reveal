import React, { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { RegisterExtpipeLayout } from 'components/layout/RegisterExtpipeLayout';
import {
  ButtonPlaced,
  CreateFormWrapper,
  InfoIcon,
  PriSecBtnWrapper,
} from 'components/styled';
import * as yup from 'yup';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { FullInput } from 'components/inputs/FullInput';
import { usePostExtpipe } from 'hooks/usePostExtpipe';
import styled from 'styled-components';
import { Button, Colors, Modal } from '@cognite/cogs.js';
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
import { createAddExtpipeInfo } from 'utils/extpipeUtils';
import { EXTPIPES_WRITES } from 'model/AclAction';
import { CapabilityCheck } from 'components/accessCheck/CapabilityCheck';
import { trackUsage } from 'utils/Metrics';
import { getContainer } from 'utils/utils';
import { styleScope } from 'styles/styleScope';
import { createLink } from '@cognite/cdf-utilities';
import { useTranslation } from 'common';
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

export const CreateExtpipe = (props: { customCancelCallback?: () => void }) => {
  const { t } = useTranslation();
  const history = useHistory();
  const location = useLocation();
  const dataSetIdFromLocation = findDataSetId(location.search);
  const { data: userInfo } = useUserInformation();
  const { data: dataSets, status: dataSetsStatus } =
    useDataSetsList(DATASET_LIST_LIMIT);
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
          const serverErrorMessage =
            translateServerErrorMessage<AddExtpipeFormInput>(errorRes?.data, {
              externalId: t('external-id-already-exist', {
                externalId: variables.extpipeInfo.externalId,
              }),
              contacts: t('contact-must-provide'),
              server: errorRes?.data?.message ?? t('try-again-later'),
            });
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
                  message: t('field-in-use', { field: fieldValue }),
                },
                { shouldFocus: true }
              );
            });
          } else {
            setError('server', {
              type: 'server',
              message: serverErrorMessage.message,
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
            labelText={t('ext-pipeline-name')}
            hintText={t('ext-pipeline-name-hint')}
            renderLabel={(labelText, inputId) => (
              <CustomLabel
                required
                htmlFor={inputId}
                data-testId="ext-pipeline-name"
              >
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
            labelText={t('external-id')}
            hintText={t('external-id-hint')}
            renderLabel={(labelText, inputId) => (
              <CustomLabel required htmlFor={inputId} data-testId="external-id">
                {labelText}
              </CustomLabel>
            )}
          />
          <FullInput
            name="description"
            control={control as any}
            defaultValue=""
            labelText={t('description')}
            hintText={t('description-hint')}
            inputId="extpipe-description"
            errors={errors}
            renderLabel={(labelText, inputId) => (
              <CustomLabel
                required={false}
                htmlFor={inputId}
                data-testId="description"
              >
                {labelText}
              </CustomLabel>
            )}
          />
          <PriSecBtnWrapper>
            {props.customCancelCallback == null ? (
              <a
                href={createLink(
                  `/data-sets${
                    dataSetIdFromLocation &&
                    `/data-set/${dataSetIdFromLocation}`
                  }`
                )}
                className="cogs-btn cogs-btn-ghost cogs-btn-secondary cogs-btn--padding"
              >
                {t('cancel')}
              </a>
            ) : (
              <Button type="ghost" onClick={props.customCancelCallback}>
                {t('cancel')}
              </Button>
            )}
            <ButtonPlaced
              type="primary"
              htmlType="submit"
              marginbottom={0}
              data-testId="create=extpipe"
            >
              {t('create')}
            </ButtonPlaced>
          </PriSecBtnWrapper>
        </CreateFormWrapper>
      </FormProvider>
    </>
  );
};

export default function CreateExtpipePage() {
  const { t } = useTranslation();

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
          appElement={document.getElementsByClassName(styleScope).item(0)!}
          getContainer={getContainer}
          footer={null}
          title={t('create-ext-pipeline')}
        >
          <CreateExtpipe />
        </Modal>
      </CapabilityCheck>
    </RegisterExtpipeLayout>
  );
}

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
