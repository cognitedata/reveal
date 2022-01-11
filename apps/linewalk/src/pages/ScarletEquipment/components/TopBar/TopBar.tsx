import { Button, Skeleton } from '@cognite/cogs.js';

import { useStorageState } from '../../hooks';

import * as Styled from './style';

type TopBarProps = {
  equipmentName: string;
};

export const TopBar = ({ equipmentName }: TopBarProps) => {
  const { documents } = useStorageState();

  return (
    <Styled.Container>
      <Button icon="ArrowLeft">Back</Button>
      <Styled.Title level={3}>{equipmentName}</Styled.Title>
      {documents.loading && <Skeleton.Rectangle width="90px" height="24px" />}
      {!(documents.loading || documents.error) && (
        <Styled.DocumentsAmount>
          {documents.data?.length}
          {documents.data?.length === 1 ? ' document' : ' documents'}
        </Styled.DocumentsAmount>
      )}
    </Styled.Container>
  );
};
