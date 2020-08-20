import React from 'react';
import { useParams } from 'react-router-dom';
import { ContentCard } from './elements';

const New = ({ name }: any) => {
  const { type } = useParams();
  return (
    <>
      <ContentCard>
        <p>New Configuration:</p>
        <p>{name}</p>
        <p>{type}</p>
      </ContentCard>
    </>
  );
};

export default New;
