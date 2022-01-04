import { useEffect } from 'react';
import { useParams } from 'react-router';
import { useApi } from 'modules/scarlet/hooks';
import { getDocuments, getPCMSData, getScannerData } from 'modules/scarlet/api';

import { BreadcrumbBar, Documents, TopBar } from './components';
import * as Styled from './style';

const ScarletEquipment = () => {
  const { unitName, equipmentName } =
    useParams<{ unitName: string; equipmentName: string }>();

  const scannerQuery = useApi(getScannerData, unitName, equipmentName);
  const pcmsQuery = useApi(getPCMSData, unitName, equipmentName);
  const documentsQuery = useApi(getDocuments, unitName, equipmentName);

  useEffect(() => console.log('!!! Scanner:', scannerQuery), [scannerQuery]);

  useEffect(() => console.log('!!! PCMS:', pcmsQuery), [pcmsQuery]);

  return (
    <Styled.Container>
      <BreadcrumbBar
        unitName={unitName}
        equipmentName={equipmentName}
        pcmsQuery={pcmsQuery}
      />
      <TopBar equipmentName={equipmentName} documentsQuery={documentsQuery} />

      <Documents documentsQuery={documentsQuery} />
    </Styled.Container>
  );
};

export default ScarletEquipment;
