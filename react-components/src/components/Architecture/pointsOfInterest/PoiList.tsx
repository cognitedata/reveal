/*!
 * Copyright 2024 Cognite AS
 */
import { ReactElement, type ReactNode, useCallback, useMemo, useState } from 'react';
import { type PointOfInterest } from '../../../architecture/concrete/pointsOfInterest/types';
import { useOnUpdateDomainObject } from '../useOnUpdate';
import { DataGrid, type DatagridColumn } from '@cognite/cogs-lab';
import { usePoiDomainObject } from './usePoiDomainObject';
import { EMPTY_ARRAY } from '../../../utilities/constants';
import { useTranslation } from '../../i18n/I18n';
import { Button, Flex } from '@cognite/cogs.js';
import { take } from 'lodash';

type RowType = {
  id: string;
  poi: PointOfInterest<unknown>;
};

export type PoiFilter = { contains: string };

export type PoiListProps = {
  onRowClick?: (poi: PointOfInterest<unknown>) => void;
  filter?: PoiFilter;
  pageLimit?: number;
};

export const PoiList = ({
  onRowClick,
  filter,
  pageLimit: inputPageLimit
}: PoiListProps): ReactNode => {
  const { t } = useTranslation();

  const pageLimit = inputPageLimit ?? Infinity;

  const [pois, setPois] = useState<Array<PointOfInterest<unknown>>>([]);
  const [selectedPoi, setSelectedPoi] = useState<PointOfInterest<unknown> | undefined>(undefined);

  const poiObject = usePoiDomainObject();

  const [currentLimit, setCurrentLimit] = useState<number>(pageLimit ?? Infinity);
  const hasMoreData = pois.length > currentLimit;

  useOnUpdateDomainObject(poiObject, () => {
    setPois([...(poiObject?.pointsOfInterest ?? EMPTY_ARRAY)]);
    setSelectedPoi(poiObject?.selectedPointsOfInterest);
  });

  const rowData = useMemo(
    () =>
      take(pois, currentLimit)
        .filter((poi) => filterPoi(poi, filter))
        .map((poi) => ({
          id: JSON.stringify(poi.id),
          name: poi.properties.title ?? JSON.stringify(poi.id),
          poi
        })),
    [pois, currentLimit, filter]
  );

  const columns: Array<DatagridColumn<RowType>> = [
    {
      field: 'name',
      headerName: t({ key: 'NAME' }),
      flex: 3
    }
  ];

  const handleShowMoreCallback = useCallback(() => {
    if (!hasMoreData) {
      return;
    }

    setCurrentLimit((lastLimit) => Math.min(pois.length, lastLimit + pageLimit));
  }, [pois, setCurrentLimit, hasMoreData, pageLimit]);

  if (poiObject === undefined) {
    return undefined;
  }

  return (
    <Flex direction="column" alignContent="center">
      <DataGrid<RowType>
        onRowClick={(row) => {
          poiObject.setSelectedPointOfInterest(row.row.poi as PointOfInterest<unknown>);
          onRowClick?.(row.row.poi as PointOfInterest<unknown>);
        }}
        columns={columns}
        data={rowData}
        selectedRows={[JSON.stringify(selectedPoi?.id)]}
        pagination={false}
        disableColumnResize
      />
      <Flex direction="row" gap={16} justifyContent="center" alignContent="center">
        {hasMoreData && (
          <Button type="tertiary" onClick={handleShowMoreCallback}>
            {t({ key: 'SHOW_MORE' })}
          </Button>
        )}
      </Flex>
    </Flex>
  );
};

function filterPoi(poi: PointOfInterest<unknown>, filter: PoiFilter | undefined): boolean {
  if (filter === undefined) {
    return true;
  }

  return (
    poi.properties.title?.includes(filter.contains) ||
    JSON.stringify(poi.id).includes(filter.contains)
  );
}
