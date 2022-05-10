import { Button, Skeleton } from '@cognite/cogs.js';
import { generatePath, useHistory } from 'react-router-dom';
import { useAppState, useFacility } from 'scarlet/hooks';
import { RoutePath } from 'scarlet/routes';

import { EquipmentStateBar } from '..';

import * as Styled from './style';

type TopBarProps = {
  unitId: string;
  equipmentId: string;
};

export const TopBar = ({ unitId, equipmentId }: TopBarProps) => {
  const { documents } = useAppState();
  const history = useHistory();
  const facility = useFacility();
  const equipmentListPath = generatePath(RoutePath.EQUIPMENT_LIST, {
    facility: facility!.path,
    unitId,
  });

  return (
    <Styled.Container>
      <Button icon="ArrowLeft" onClick={() => history.push(equipmentListPath)}>
        Dashboard
      </Button>
      <Styled.Title level={3}>{equipmentId}</Styled.Title>
      {documents.loading && <Skeleton.Rectangle width="90px" height="24px" />}
      {!(documents.loading || documents.error) && (
        <Styled.DocumentsAmount>
          {documents.data?.length}
          {documents.data?.length === 1 ? ' document' : ' documents'}
        </Styled.DocumentsAmount>
      )}
      <Styled.StateContainer>
        <EquipmentStateBar />
      </Styled.StateContainer>
    </Styled.Container>
  );
};
