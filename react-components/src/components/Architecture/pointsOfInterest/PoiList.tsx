/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement, ReactNode, useState } from 'react';
import { type PointsOfInterestDomainObject } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestDomainObject';
import { type PointOfInterest } from '../../../architecture/concrete/pointsOfInterest/types';
import { useOnUpdateDomainObject } from '../useOnUpdate';
import { DataGrid, DatagridColumn } from '@cognite/cogs-lab';
import { usePoiDomainObject } from './usePoiDomainObject';
import { EMPTY_ARRAY } from '../../../utilities/constants';
import { useTranslation } from '../../i18n/I18n';

type RowType = {
  id: string;
  poi: PointOfInterest<any>;
};

export const PoiList = (): ReactNode => {
  const { t } = useTranslation();

  const [pois, setPois] = useState<Array<PointOfInterest<any>>>([]);
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest<any> | undefined>(undefined);

  const poiObject = usePoiDomainObject();

  useOnUpdateDomainObject(poiObject, () => {
    setPois([...(poiObject?.pointsOfInterest ?? EMPTY_ARRAY)]);
    setSelectedPoi(poiObject?.selectedPointsOfInterest);
  });

  const columns: DatagridColumn<RowType>[] = [
    {
      field: 'name',
      headerName: t('NAME', 'Name'),
      flex: 3
    }
  ];

  if (poiObject === undefined) {
    return undefined;
  }

  return (
    <DataGrid<RowType>
      onRowClick={(row) => {
        poiObject.setSelectedPointOfInterest(row.row.poi as PointOfInterest<any>);
      }}
      columns={columns}
      data={pois.map((poi) => ({
        id: poi.id,
        name: poi.id,
        poi
      }))}
      selectedRows={[selectedPoi?.id]}
      pagination={false}
      disableColumnResize
    />
  );
};
