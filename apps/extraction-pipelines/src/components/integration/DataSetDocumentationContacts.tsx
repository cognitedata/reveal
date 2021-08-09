import React, { FunctionComponent } from 'react';
import { Card2Sides, CardValue, StyledTitleCard } from 'styles/StyledCard';
import { Icon } from '@cognite/cogs.js';
import { createLink } from '@cognite/cdf-utilities';
import { DivFlex } from 'styles/flex/StyledFlex';
import { useSelectedIntegration } from 'hooks/useSelectedIntegration';
import { TableHeadings } from 'components/table/IntegrationTableCol';

export const CONNECTED_DATA_SET_LABEL: Readonly<string> = 'Connected data set';
export const GO_TO_DATA_SET_LINK: Readonly<string> =
  'Go to data set detail page';
export const DOCUMENTATION_LABEL: Readonly<string> = 'Documentation';
export const DOCUMENTATION_TEXT: Readonly<string> =
  'Add or edit documentation and relevant links.';
export const DOCUMENTATION_LINK: Readonly<string> = 'Add/edit documentation';
export const CONTACTS_TEXT: Readonly<string> =
  'Add or edit contacts including name, role and notification configuration.';
interface DataSetDocumentationContactsProps {}

export const DataSetDocumentationContacts: FunctionComponent<DataSetDocumentationContactsProps> = () => {
  const { integration } = useSelectedIntegration();

  return (
    <DivFlex align="stretch">
      <Card2Sides>
        <div className="card-section">
          <StyledTitleCard>
            <Icon type="Grid" />
            {CONNECTED_DATA_SET_LABEL}
          </StyledTitleCard>
          <CardValue>{integration?.dataSet?.name}</CardValue>
        </div>
        <div className="card-section">
          <span />
          <a
            href={createLink(`/data-sets/data-set/${integration?.dataSet?.id}`)}
          >
            {GO_TO_DATA_SET_LINK}
          </a>
        </div>
      </Card2Sides>
      <Card2Sides>
        <div className="card-section">
          <StyledTitleCard>
            <Icon type="Document" />
            {DOCUMENTATION_LABEL}
          </StyledTitleCard>
        </div>
        <div className="card-section">
          <p>{DOCUMENTATION_TEXT}</p>
          <a href="#documentation-heading">{DOCUMENTATION_LINK}</a>
        </div>
      </Card2Sides>
      <Card2Sides>
        <div className="card-section">
          <StyledTitleCard>
            <Icon type="Person" />
            {TableHeadings.CONTACTS}
          </StyledTitleCard>
          <CardValue>{integration?.contacts.length} contacts</CardValue>
        </div>
        <div className="card-section">
          <p>{CONTACTS_TEXT}</p>
          <a href="#contacts-heading">Add/edit contacts</a>
        </div>
      </Card2Sides>
    </DivFlex>
  );
};
