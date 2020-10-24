import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from 'utils/functions';
import { SessionType } from '../../../typings/interfaces';
import PetrelStudioToOpenWorks from './PetrelStudioToOpenWorks';
import OpenWorksToPetrelStudio from './OpenWorksToPetrelStudio';

const New = () => {
  const query = useQuery();
  const name = query.get('name');
  const { type } = useParams();

  return (
    <>
      {type === SessionType.PS_TO_OW && <PetrelStudioToOpenWorks name={name} />}
      {type === SessionType.OW_TO_PS && <OpenWorksToPetrelStudio name={name} />}
    </>
  );
};

export default New;
