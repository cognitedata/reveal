import React, { FunctionComponent, PropsWithChildren } from 'react';
import styled from 'styled-components';
import InlineEdit from 'components/integration/InlineEdit';
import { DetailFieldNames } from 'model/Integration';
import * as yup from 'yup';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { useIntegrationById } from 'hooks/useIntegration';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { Schedule } from 'components/integration/edit/Schedule';
import { Icon } from '@cognite/cogs.js';
import { rootUpdate } from 'hooks/details/useDetailsUpdate';
import { useAppEnv } from 'hooks/useAppEnv';
import { FieldVerticalDisplay } from 'components/integration/fields/FieldVerticalDisplay';
import EditRawTable from 'components/inputs/rawSelector/EditRawTable';
import { ContactsView } from 'components/integration/ContactsView';
import { MetaData } from 'components/integration/MetaData';
import { EditDataSetId } from 'components/integration/edit/EditDataSetId';
import { bottomSpacing, sideBarSectionSpacing } from 'styles/StyledVariables';
import { AllIconTypes } from '@cognite/cogs.js/dist/Atoms/Icon/Icon';

const SectionDiv = styled.div`
  background-color: white;
  margin-bottom: 10px;
  border-radius: 3px;
`;
const SectionHeader = styled.div`
  font-size: 1.1em;
  font-weight: 500;
  padding: 1em;
  border-bottom: 1px solid #eee;
  display: flex;
  align-items: center;
`;
const SectionBody = styled.div`
  padding: 0.3em;
`;

export const Section = (
  props: PropsWithChildren<{ title: string; icon: AllIconTypes }>
) => {
  return (
    <SectionDiv className="z-2">
      <SectionHeader>
        <Icon type={props.icon} style={{ marginRight: '0.5rem' }} />{' '}
        {props.title}
      </SectionHeader>
      <SectionBody>{props.children}</SectionBody>
    </SectionDiv>
  );
};

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
    <div>
      <Section title="Basic information" icon="World">
        <InlineEdit
          name="description"
          label={DetailFieldNames.DESCRIPTION}
          canEdit={canEdit}
          schema={yup.object().shape({
            description: yup.string(),
          })}
          defaultValues={{ description: integration?.description }}
          fullWidth
          updateFn={rootUpdate({ integration, name: 'description', project })}
          marginBottom
          showLabel
        />
        <EditDataSetId canEdit={canEdit} />
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
        <Schedule
          name="schedule"
          integration={integration}
          label={TableHeadings.SCHEDULE}
          canEdit={canEdit}
        />
      </Section>
      <Section title="Contacts" icon="Public">
        <ContactsView canEdit={canEdit} />
      </Section>
      <Section title="Raw database • Raw table" icon="Datasource">
        <EditRawTable canEdit={canEdit} />
      </Section>
      <Section title="Additional metadata" icon="DataTable">
        <MetaData canEdit={canEdit} />
      </Section>
      <Section title="About extraction pipeline" icon="Info">
        <FieldVerticalDisplay
          label={DetailFieldNames.ID}
          fieldName="id"
          fieldValue={integration?.id}
          marginBottom={bottomSpacing}
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
      </Section>
    </div>
  );
};
