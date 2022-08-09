import React, { FunctionComponent } from 'react';
import InlineEdit from 'components/extpipe/InlineEdit';
import { DetailFieldNames } from 'model/Extpipe';
import * as yup from 'yup';
import { useSelectedExtpipe } from 'hooks/useSelectedExtpipe';
import { useExtpipeById } from 'hooks/useExtpipe';
import { TableHeadings } from 'components/table/ExtpipeTableCol';
import { Schedule } from 'components/extpipe/edit/Schedule';
import { rootUpdate } from 'hooks/details/useDetailsUpdate';
import { FieldVerticalDisplay } from 'components/extpipe/fields/FieldVerticalDisplay';
import RawTablesSection from 'components/inputs/rawSelector/RawTablesSection';
import { Column, ContactsSection } from 'components/extpipe/ContactsSection';
import { MetaDataSection } from 'components/extpipe/MetaDataSection';
import { EditDataSetId } from 'components/extpipe/edit/EditDataSetId';
import { Section } from 'components/extpipe/Section';
import { NotificationSection } from 'components/extpipe/NotificationSection';
import {
  externalIdRule,
  metaDescriptionSchema,
  sourceSchema,
} from 'utils/validation/extpipeSchemas';
import { getProject } from '@cognite/cdf-utilities';

interface ExtpipeInformationProps {
  canEdit: boolean;
}

export const ExtpipeInformation: FunctionComponent<ExtpipeInformationProps> = ({
  canEdit,
}) => {
  const project = getProject();
  const { extpipe: selected } = useSelectedExtpipe();
  const { data: extpipe } = useExtpipeById(selected?.id);
  if (!extpipe || !project) {
    return null;
  }

  return (
    <>
      <Section title="Basic information" icon="World">
        <InlineEdit
          name="description"
          hintText="Describe the extraction pipeline."
          placeholder="Enter description"
          label={DetailFieldNames.DESCRIPTION}
          canEdit={canEdit}
          schema={metaDescriptionSchema}
          defaultValues={{ description: extpipe?.description }}
          fullWidth
          updateFn={rootUpdate({ extpipe, name: 'description', project })}
          marginBottom
          showLabel
        />
        <EditDataSetId canEdit={canEdit} />
        <InlineEdit
          name="source"
          hintText="Enter the name of the extraction pipeline source system."
          placeholder="Enter source"
          label={DetailFieldNames.SOURCE}
          canEdit={canEdit}
          schema={sourceSchema}
          updateFn={rootUpdate({ extpipe, name: 'source', project })}
          defaultValues={{
            source: extpipe?.source,
          }}
          fullWidth
          showLabel
          marginBottom
        />
        <InlineEdit
          name="externalId"
          hintText="Enter a unique identifier. Use this ID when setting up status and heartbeat reporting for extractors."
          placeholder="Enter external ID"
          label={DetailFieldNames.EXTERNAL_ID}
          canEdit={canEdit}
          schema={yup.object().shape(externalIdRule)}
          defaultValues={{ externalId: extpipe?.externalId }}
          fullWidth
          updateFn={rootUpdate({ extpipe, name: 'externalId', project })}
          marginBottom
          showLabel
        />
        <Schedule
          name="schedule"
          extpipe={extpipe}
          label={TableHeadings.SCHEDULE}
          canEdit={canEdit}
        />
      </Section>
      <NotificationSection extpipe={extpipe} canEdit={canEdit} />
      <ContactsSection canEdit={canEdit} />
      <RawTablesSection canEdit={canEdit} />
      <MetaDataSection canEdit={canEdit} />
      <Section title="About extraction pipeline" icon="Info">
        <Column>
          <FieldVerticalDisplay
            label={DetailFieldNames.ID}
            fieldName="id"
            fieldValue={extpipe?.id}
          />
          <FieldVerticalDisplay
            label={DetailFieldNames.CREATED_BY}
            fieldName="createdBy"
            fieldValue={extpipe?.createdBy}
          />
          <FieldVerticalDisplay
            label={DetailFieldNames.CREATED_TIME}
            fieldName="createdTime"
            fieldValue={extpipe?.createdTime}
          />
          <FieldVerticalDisplay
            label={DetailFieldNames.LAST_UPDATED_TIME}
            fieldName="lastUpdatedTime"
            fieldValue={extpipe?.lastUpdatedTime}
          />
        </Column>
      </Section>
    </>
  );
};
