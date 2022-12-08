import { Button, Skeleton } from '@cognite/cogs.js';
import { generatePath, useHistory, useLocation } from 'react-router-dom';
import { useAppState, useFacility, useApi } from 'hooks';
import { PAGES } from 'pages/Menubar';
import { saveEquipmentRaw } from 'api';

import { EquipmentStateBar } from '..';

import * as Styled from './style';

type TopBarProps = {
  unitId: string;
  equipmentId: string;
};

export const TopBar = ({ unitId, equipmentId }: TopBarProps) => {
  const { documents, equipment } = useAppState();
  const facility = useFacility();
  const { search } = useLocation();
  const history = useHistory();
  const equipmentListPath = generatePath(PAGES.UNIT, {
    facility: facility!.path,
    unitId,
  });

  const { trigger: saveEquipmentToRaw } = useApi(
    saveEquipmentRaw,
    { facility, unitId, equipmentId, equipment: equipment.data },
    { skip: true }
  );

  return (
    <Styled.Container>
      <Button
        icon="ArrowLeft"
        onClick={() => history.push({ pathname: equipmentListPath, search })}
      >
        Dashboard
      </Button>
      <Styled.Title level={3}>{equipmentId}</Styled.Title>
      {documents.loading && <Skeleton.Rectangle width="90px" height="24px" />}
      {!(documents.loading || documents.error) && (
        <Styled.DocumentsNumber>
          {documents.data?.length}
          {documents.data?.length === 1 ? ' document' : ' documents'}
        </Styled.DocumentsNumber>
      )}
      <Styled.StateContainer>
        <EquipmentStateBar />
      </Styled.StateContainer>
      <Button onClick={saveEquipmentToRaw}>save</Button>
    </Styled.Container>
  );
};
