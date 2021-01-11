import React, { FunctionComponent } from 'react';
import { Colors, Detail, Title } from '@cognite/cogs.js';
import OwnerView from 'components/form/OwnerView';
import ContactsView from 'components/form/ContactsView';
import { GridRowStyle, GridWithTopMargin } from 'styles/grid/StyledGrid';
import styled from 'styled-components';
import { TableHeadings } from '../../table/IntegrationTableCol';

interface OwnProps {}

type Props = OwnProps;
const ContactsGridHeading = styled((props) => (
  <GridRowStyle {...props}>{props.children}</GridRowStyle>
))`
  border-bottom: 0.0625rem solid ${Colors['greyscale-grey3'].hex()};
`;

const ContactsDetails: FunctionComponent<Props> = () => {
  return (
    <GridWithTopMargin role="grid">
      <Title level={4}>{TableHeadings.CONTACTS}</Title>
      <ContactsGridHeading role="row">
        <Detail
          id="contacts-heading-role"
          strong
          role="columnheader"
          aria-colindex={1}
        >
          Role
        </Detail>
        <Detail
          id="contacts-heading-notification"
          strong
          role="columnheader"
          aria-colindex={2}
        >
          Notification
        </Detail>
        <Detail
          id="contacts-heading-name"
          strong
          role="columnheader"
          aria-colindex={3}
        >
          Name
        </Detail>
        <Detail
          id="contacts-heading-email"
          strong
          role="columnheader"
          aria-colindex={4}
        >
          E-mail
        </Detail>
      </ContactsGridHeading>
      <OwnerView />
      <ContactsView />
    </GridWithTopMargin>
  );
};

export default ContactsDetails;
