import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { Button } from '@cognite/cogs.js';
import { SessionType } from '../../../typings/interfaces';
import PetrelStudioToOpenWorks from './PetrelStudioToOpenWorks';
import { Configuration, Header } from '../elements';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const New = () => {
  const query = useQuery();
  const name = query.get('name');
  const { type } = useParams();

  return (
    <>
      <Header>
        <b>{name}</b>
        <Button type="primary" style={{ height: '36px' }} disabled>
          Save Configuration
        </Button>
      </Header>
      <Configuration>
        {type === SessionType.PS_TO_OW && (
          <PetrelStudioToOpenWorks name={name || 'No name'} />
        )}
        {type === SessionType.OW_TO_PS && <h1>TBD</h1>}
      </Configuration>
    </>
  );
};

export default New;
