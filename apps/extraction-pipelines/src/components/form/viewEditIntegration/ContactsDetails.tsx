import React, { FunctionComponent } from 'react';
import { Title } from '@cognite/cogs.js';
import OwnerView from 'components/form/OwnerView';
import ContactsView from 'components/form/ContactsView';
import { GridWithTopMargin } from 'styles/grid/StyledGrid';
import { TableHeadings } from '../../table/IntegrationTableCol';

interface OwnProps {}

type Props = OwnProps;

const ContactsDetails: FunctionComponent<Props> = () => {
  return (
    <GridWithTopMargin role="grid">
      <Title level={4}>{TableHeadings.CONTACTS}</Title>
      <OwnerView />
      <ContactsView />
    </GridWithTopMargin>
  );
};

export default ContactsDetails;
