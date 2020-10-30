import React, { FunctionComponent } from 'react';
import IntegrationsTable from './IntegrationsTable';

interface OwnProps {}

type Props = OwnProps;

const Integrations: FunctionComponent<Props> = () => {
  return (
    <>
      <IntegrationsTable />
    </>
  );
};

export default Integrations;
