import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import InlineEdit from 'components/integration/InlineEdit';
import { DetailFieldNames } from 'model/Integration';
import * as yup from 'yup';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { Schedule } from 'components/integration/edit/Schedule';
import { Colors } from '@cognite/cogs.js';
import { rootUpdate } from 'hooks/details/useDetailsUpdate';
import { useAppEnv } from 'hooks/useAppEnv';
import { FieldVerticalDisplay } from 'components/integration/fields/FieldVerticalDisplay';
import EditRawTable from 'components/inputs/rawSelector/EditRawTable';
import { ContactsView } from 'components/integration/ContactsView';
import { MetaData } from 'components/integration/MetaData';
import { EditDataSetId } from 'components/integration/edit/EditDataSetId';
import { bottomSpacing, sideBarSectionSpacing } from 'styles/StyledVariables';

const Wrapper = styled.div`
  padding: 2rem;
  background-color: ${Colors['greyscale-grey1'].hex()};
`;
interface IntegrationInformationProps {
  canEdit: boolean;
}

export const IntegrationInformation: FunctionComponent<IntegrationInformationProps> = ({
  canEdit,
}) => {
  const { project } = useAppEnv();
  const { integration: selected } = useSelectedIntegration();
  const { data: integration } = useIntegrationById(selected?.id);
  if (!integration || !project) {
    return null;
  }

  return (
    <Wrapper>
      <ContactsView canEdit={canEdit} />
      <InlineEdit
        name="externalId"
        label={DetailFieldNames.EXTERNAL_ID}
        canEdit={canEdit}
        schema={yup.object().shape({
          externalId: yup.string().required('ExternalId is required'),
        })}
        defaultValues={{ externalId: integration?.externalId }}
        fullWidth
        updateFn={rootUpdate({ integration, name: 'externalId', project })}
        marginBottom
        showLabel
      />
      <FieldVerticalDisplay
        label={DetailFieldNames.ID}
        fieldName="id"
        fieldValue={integration?.id}
        marginBottom={bottomSpacing}
      />
      <EditDataSetId canEdit={canEdit} />
      <EditRawTable canEdit={canEdit} />
      <InlineEdit
        name="source"
        label={DetailFieldNames.SOURCE}
        canEdit={canEdit}
        schema={yup.object().shape({})}
        updateFn={rootUpdate({ integration, name: 'source', project })}
        defaultValues={{
          source: integration?.source,
        }}
        fullWidth
        showLabel
        marginBottom
      />
      <Schedule
        name="schedule"
        integration={integration}
        label={TableHeadings.SCHEDULE}
        canEdit={canEdit}
      />
      <FieldVerticalDisplay
        label={DetailFieldNames.CREATED_BY}
        fieldName="createdBy"
        fieldValue={integration?.createdBy}
        marginBottom={bottomSpacing}
      />
      <FieldVerticalDisplay
        label={DetailFieldNames.CREATED_TIME}
        fieldName="createdTime"
        fieldValue={integration?.createdTime}
        marginBottom={bottomSpacing}
      />
      <FieldVerticalDisplay
        label={DetailFieldNames.LAST_UPDATED_TIME}
        fieldName="lastUpdatedTime"
        fieldValue={integration?.lastUpdatedTime}
        marginBottom={sideBarSectionSpacing}
      />
      <MetaData canEdit={canEdit} />
    </Wrapper>
  );
};
