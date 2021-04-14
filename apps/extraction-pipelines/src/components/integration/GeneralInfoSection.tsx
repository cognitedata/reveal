import React, { FunctionComponent } from 'react';
import { DetailFieldNames } from 'model/Integration';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import FieldView from 'components/form/FieldView';
import { DetailsGrid } from 'components/form/viewEditIntegration/MainDetails';
import EditableField from 'components/integration/EditableField';
import * as yup from 'yup';
import { Schedule } from 'components/integration/Schedule';
import { Colors } from '@cognite/cogs.js';
import styled from 'styled-components';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import {
  descriptionSchema,
  MAX_DESC_LENGTH,
  nameSchema,
} from 'utils/validation/integrationSchemas';
import { StyledTitle2 } from 'styles/StyledHeadings';
import TextAreaField from 'components/integration/TextAreaField';
import { GENERAL_INFO_HEADING } from 'utils/constants';

const GeneralInfoWrapper = styled(DetailsGrid)`
  padding: 1rem;
  border-right: 1px solid ${Colors['greyscale-grey2'].hex()};
`;

export const GeneralInfoSection: FunctionComponent = () => {
  const { integration } = useSelectedIntegration();
  if (!integration) {
    return <p>No integration found</p>;
  }
  return (
    <GeneralInfoWrapper role="grid">
      <StyledTitle2 id="general-info-heading">
        {GENERAL_INFO_HEADING}
      </StyledTitle2>
      <EditableField
        integration={integration}
        name="name"
        label={TableHeadings.NAME}
        schema={nameSchema}
        defaultValues={{ name: integration?.name }}
        fullWidth
      />
      <EditableField
        integration={integration}
        name="externalId"
        label={DetailFieldNames.EXTERNAL_ID}
        schema={yup.object().shape({
          externalId: yup.string().required('ExternalId is required'),
        })}
        defaultValues={{ externalId: integration?.externalId }}
        fullWidth
      />
      <FieldView
        label={DetailFieldNames.ID}
        fieldName="id"
        fieldValue={integration?.id}
      />
      <FieldView
        label={DetailFieldNames.CREATED_BY}
        fieldName="createdBy"
        fieldValue={integration?.createdBy}
      />
      <FieldView
        label={DetailFieldNames.CREATED_TIME}
        fieldName="createdTime"
        fieldValue={integration?.createdTime}
      />
      <FieldView
        label={DetailFieldNames.LAST_UPDATED_TIME}
        fieldName="lastUpdatedTime"
        fieldValue={integration?.lastUpdatedTime}
      />
      <Schedule
        name="schedule"
        integration={integration}
        label={TableHeadings.SCHEDULE}
      />
      <TextAreaField
        integration={integration}
        name="description"
        label={DetailFieldNames.DESCRIPTION}
        schema={descriptionSchema}
        defaultValues={{ description: integration?.description }}
        maxCount={MAX_DESC_LENGTH}
      />
    </GeneralInfoWrapper>
  );
};
