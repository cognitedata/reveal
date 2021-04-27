import React, {
  FunctionComponent,
  PropsWithChildren,
  useEffect,
  useState,
} from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { createLink, useUserContext } from '@cognite/cdf-utilities';
import { CANCEL, SAVE } from 'utils/constants';
import { RegisterIntegrationLayout } from 'components/layout/RegisterIntegrationLayout';
import { CreateFormWrapper } from 'styles/StyledForm';
import { ButtonPlaced } from 'styles/StyledButton';
import * as yup from 'yup';
import { useForm } from 'react-hook-form';
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
import { INTEGRATIONS } from 'utils/baseURL';
import { INTEGRATION } from 'routing/RoutingConfig';
import { translateServerErrorMessage } from 'utils/error/TranslateErrorMessages';
import { usePostIntegration } from 'hooks/usePostIntegration';
import {
  DESCRIPTION_HINT,
  DESCRIPTION_LABEL,
  descriptionRule,
} from 'pages/create/DocumentationPage';
import { GridH2Wrapper, SideInfo } from 'styles/StyledPage';
import ExtractorDownloadsLink from 'components/links/ExtractorDownloadsLink';
import styled from 'styled-components';
import { Colors, Icon } from '@cognite/cogs.js';
import { PriSecBtnWrapper } from 'styles/StyledWrapper';
import { DataSetModel } from 'model/DataSetModel';
import { nameRule } from 'utils/validation/integrationSchemas';

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
const ADD_MORE_INFO_HEADING: Readonly<string> =
  'Add more integration information';
const ADD_MORE_INFO_TEXT_1: Readonly<string> =
  ' You could also register additional information such as scheduling and other documentation. This could give value to users of data set and integration. for example when troubleshooting.';
const ADD_MORE_INFO_TEXT_2: Readonly<string> =
  'You will be able to do add this information on your integration page.';
const ADD_MORE_INFO_LINK: Readonly<string> =
  'Read about registering an integration';
const NOT_LINKED: Readonly<string> =
  'Integration will not be linked to data set. You can link your integration to a data set using edit later.';

const linkDataSetText = (dataSet: DataSetModel): Readonly<string> => {
  return `Integration will be linked to data set: ${dataSet.name} (${dataSet.id})`;
};
interface CreateIntegrationProps {}

interface AddIntegrationFormInput {
  name: string;
  externalId: string;
  description?: string;
  dataSetId?: string;
}
const pageSchema = yup
  .object()
  .shape({ ...nameRule, ...externalIdRule, ...descriptionRule });

const findDataSetId = (search: string) => {
  return new URLSearchParams(search).get('dataSetId');
};
const CreateIntegration: FunctionComponent<CreateIntegrationProps> = (
  _: PropsWithChildren<CreateIntegrationProps>
) => {
  const [dataSetLoadError, setDataSetLoadError] = useState<string | null>(null);
  const history = useHistory();
  const location = useLocation();
  const user = useUserContext();
  const { search } = location;
  const dataSetId = findDataSetId(search) ?? '';
  const { mutate } = usePostIntegration();
  const {
    control,
    errors,
    setError,
    handleSubmit,
  } = useForm<AddIntegrationFormInput>({
    resolver: yupResolver(pageSchema),
    defaultValues: {
      name: '',
      externalId: '',
      description: '',
      dataSetId,
    },
    reValidateMode: 'onSubmit',
  });
  const { data, isLoading, error } = useDataSet(
    parseInt(dataSetId, 10),
    dataSetLoadError ? 0 : 3
  );

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

  const handleNext = (fields: AddIntegrationFormInput) => {
    const creator = {
      name: '',
      email: user.username ?? '',
      role: 'Creator',
      sendNotification: true,
    };
    const integrationInfo = {
      ...fields,
      ...(data && { dataSetId }),
      contacts: [creator],
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

  return (
    <RegisterIntegrationLayout>
      {dataSetLoadError && (
        <InfoMessage
          id="dataset-error"
          role="region"
          aria-live="polite"
          color={`${Colors.yellow.hex()}`}
        >
          <Icon type="Info" />
          {dataSetLoadError}
        </InfoMessage>
      )}
      {data && (
        <InfoMessage id="dataset-data" role="region" aria-live="polite">
          <Icon type="Info" />
          {linkDataSetText(data[0])}
        </InfoMessage>
      )}
      {!dataSetId && (
        <InfoMessage id="dataset-data" role="region" aria-live="polite">
          <Icon type="Info" />
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
        />
        <FullInput
          name="externalId"
          inputId="integration-external-id"
          defaultValue=""
          control={control}
          errors={errors}
          labelText={INTEGRATION_EXTERNAL_ID_HEADING}
          hintText={EXTERNAL_ID_HINT}
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
      </CreateFormWrapper>
      <SideInfo>
        <GridH2Wrapper>{ADD_MORE_INFO_HEADING}</GridH2Wrapper>
        <p>{ADD_MORE_INFO_TEXT_1}</p>
        <p>{ADD_MORE_INFO_TEXT_2}</p>
        <ExtractorDownloadsLink
          link={{ path: 'to' }}
          linkText={ADD_MORE_INFO_LINK}
        />
      </SideInfo>
    </RegisterIntegrationLayout>
  );
};
export default CreateIntegration;
