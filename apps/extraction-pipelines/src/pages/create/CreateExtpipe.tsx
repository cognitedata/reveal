import React, { useEffect } from 'react';
import { FieldValues, FormProvider, useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';

import styled from 'styled-components';

import { useTranslation } from '@extraction-pipelines/common';
import { ScheduleFormInput } from '@extraction-pipelines/components/extpipe/edit/Schedule';
import { FullInput } from '@extraction-pipelines/components/inputs/FullInput';
import { RegisterExtpipeLayout } from '@extraction-pipelines/components/layout/RegisterExtpipeLayout';
import {
  ButtonPlaced,
  CreateFormWrapper,
  InfoIcon,
  PriSecBtnWrapper,
} from '@extraction-pipelines/components/styled';
import { useDataSetsList } from '@extraction-pipelines/hooks/useDataSetsList';
import { usePostExtpipe } from '@extraction-pipelines/hooks/usePostExtpipe';
import { useUserInformation } from '@extraction-pipelines/hooks/useUserInformation';
import { ExtpipeRawTable } from '@extraction-pipelines/model/Extpipe';
import { User } from '@extraction-pipelines/model/User';
import DataSetIdInput, {
  DATASET_LIST_LIMIT,
} from '@extraction-pipelines/pages/create/DataSetIdInput';
import { EXT_PIPE_PATH } from '@extraction-pipelines/routing/RoutingConfig';
import { createExtPipePath } from '@extraction-pipelines/utils/baseURL';
import { translateServerErrorMessage } from '@extraction-pipelines/utils/error/TranslateErrorMessages';
import { createAddExtpipeInfo } from '@extraction-pipelines/utils/extpipeUtils';
import { trackUsage } from '@extraction-pipelines/utils/Metrics';
import {
  dataSetIdRule,
  descriptionRule,
  externalIdRule,
  nameRule,
} from '@extraction-pipelines/utils/validation/extpipeSchemas';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Colors, Modal } from '@cognite/cogs.js';
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
  const navigate = useNavigate();
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
          navigate(createExtPipePath(`/${EXT_PIPE_PATH}/${newExtpipeId}`));
        },
        onError: (errorRes, variables) => {
          const serverErrorMessage =
            translateServerErrorMessage<AddExtpipeFormInput>(errorRes, {
              externalId: t('external-id-already-exist', {
                externalId: variables.extpipeInfo.externalId,
              }),
              contacts: t('contact-must-provide'),
              server: errorRes?.message ?? t('try-again-later'),
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
              <p>{errors.server.message?.toString()}</p>
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
                data-testid="ext-pipeline-name"
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
              <CustomLabel required htmlFor={inputId} data-testid="external-id">
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
                data-testid="description"
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
              data-testid="create=extpipe"
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
      <Modal
        visible
        size="large"
        closable={false}
        hideFooter
        title={t('create-ext-pipeline')}
      >
        <CreateExtpipe />
      </Modal>
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
              props.color ?? `${Colors['text-icon--interactive--default']}`};
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
