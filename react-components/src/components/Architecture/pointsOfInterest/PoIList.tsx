import { useState } from 'react';
import { PointsOfInterestDomainObject } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestDomainObject';
import { PointOfInterest } from '../../../architecture/concrete/pointsOfInterest/types';
import { useOnUpdateDomainObject } from '../useOnUpdate';
import { DataGrid, SelectPanel } from '@cognite/cogs-lab';
import { PinIcon } from '@cognite/cogs.js';

const columns = [
  {
    field: 'name'
  }
];

type RowType = {
  id: string;
  poi: PointOfInterest<any>;
};

export const PoiList = ({ poiObject }: { poiObject: PointsOfInterestDomainObject<any> }) => {
  const [pois, setPois] = useState<PointOfInterest<any>[]>([]);

  useOnUpdateDomainObject(poiObject, () => {
    setPois(poiObject.pointsOfInterest);
  });

  return (
    <>
      <DataGrid<RowType>
        onRowClick={(row) => {
          console.log('Whaaat');
          poiObject.setSelectedPointsOfInterest(row.row.poi as PointOfInterest<any>);
        }}
        columns={columns}
        data={pois.map((poi) => ({
          id: poi.id,
          name: poi.id,
          poi: poi
        }))}
        pagination={false}
        disableColumnResize
        disableRowStripes
        disableMultipleRowSelection
      />
    </>
  );
};
