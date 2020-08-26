import React from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { SessionType } from '../../../typings/interfaces';
import PetrelStudioToOpenWorks from './PetrelStudioToOpenWorks';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

const New = () => {
  const query = useQuery();
  const name = query.get('name');
  const { type } = useParams();

  return (
    <>
      {type === SessionType.PS_TO_OW && <PetrelStudioToOpenWorks name={name} />}
      {type === SessionType.OW_TO_PS && <h1>TBD</h1>}
    </>
  );
};

export default New;
