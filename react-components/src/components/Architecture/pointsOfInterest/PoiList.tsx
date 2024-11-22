/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactNode, useMemo, useState } from 'react';
import { type PointOfInterest } from '../../../architecture/concrete/pointsOfInterest/types';
import { useOnUpdateDomainObject } from '../useOnUpdate';
import { DataGrid, type DatagridColumn } from '@cognite/cogs-lab';
import { usePoiDomainObject } from './usePoiDomainObject';
import { EMPTY_ARRAY } from '../../../utilities/constants';
import { useTranslation } from '../../i18n/I18n';

type RowType = {
  id: string;
  poi: PointOfInterest<unknown>;
};

export type PoiListProps = {
  onRowClick?: (poi: PointOfInterest<unknown>) => void;
};

export const PoiList = ({ onRowClick }: PoiListProps): ReactNode => {
  const { t } = useTranslation();

  const [pois, setPois] = useState<Array<PointOfInterest<unknown>>>([]);
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest<unknown> | undefined>(undefined);

  const poiObject = usePoiDomainObject();

  useOnUpdateDomainObject(poiObject, () => {
    setPois([...(poiObject?.pointsOfInterest ?? EMPTY_ARRAY)]);
    setSelectedPoi(poiObject?.selectedPointsOfInterest);
  });

  const rowData = useMemo(
    () =>
      pois.map((poi) => ({
        id: JSON.stringify(poi.id),
        name: poi.properties.title ?? JSON.stringify(poi.id),
        poi
      })),
    [pois]
  );

  const columns: Array<DatagridColumn<RowType>> = [
    {
      field: 'name',
      headerName: t({ key: 'NAME' }),
      flex: 3
    }
  ];

  if (poiObject === undefined) {
    return undefined;
  }

  return (
    <DataGrid<RowType>
      onRowClick={(row) => {
        poiObject.setSelectedPointOfInterest(row.row.poi as PointOfInterest<unknown>);
        onRowClick?.(row.row.poi);
      }}
      columns={columns}
      data={rowData}
      selectedRows={[JSON.stringify(selectedPoi?.id)]}
      pagination={false}
      disableColumnResize
    />
  );
};
