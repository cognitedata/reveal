import React, { FunctionComponent } from 'react';
import { Title } from '@cognite/cogs.js';
import OwnerView from 'components/form/OwnerView';
import styled from 'styled-components';
import ContactsView from 'components/form/ContactsView';
import { TableHeadings } from '../table/IntegrationTableCol';

export const Grid = styled((props) => <div {...props}>{props.children}</div>)`
  display: grid;
  grid-template-columns: 1fr;
`;
export const GridWithTopMargin = styled((props) => (
  <Grid {...props}>{props.children}</Grid>
))`
  margin-top: 3rem;
`;

interface OwnProps {}

type Props = OwnProps;

const ContactsDetails: FunctionComponent<Props> = () => {
  return (
    <GridWithTopMargin>
      <Title level={4}>{TableHeadings.CONTACTS}</Title>
      <OwnerView />
      <ContactsView />
    </GridWithTopMargin>
  );
};

export default ContactsDetails;
