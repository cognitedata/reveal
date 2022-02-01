import { Button, Skeleton } from '@cognite/cogs.js';
import { generatePath, useHistory } from 'react-router-dom';
import { useAppState } from 'scarlet/hooks';
import { RoutePath } from 'scarlet/routes';

import * as Styled from './style';

type TopBarProps = {
  unitName: string;
  equipmentName: string;
};

export const TopBar = ({ unitName, equipmentName }: TopBarProps) => {
  const { documents } = useAppState();
  const history = useHistory();
  const equipmentListPath = generatePath(RoutePath.EQUIPMENT_LIST, {
    unitName,
  });

  return (
    <Styled.Container>
      <Button icon="ArrowLeft" onClick={() => history.push(equipmentListPath)}>
        Back
      </Button>
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
