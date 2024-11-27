/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactNode, useCallback, useMemo, useState } from 'react';
import { type PointOfInterest } from '../../../architecture/concrete/pointsOfInterest/types';
import { DataGrid, type DatagridColumn } from '@cognite/cogs-lab';
import { useTranslation } from '../../i18n/I18n';
import { Button, Flex } from '@cognite/cogs.js';
import { take } from 'lodash';
import { useFilterPointsOfInterest } from './useFilterPointsOfInterest';
import { usePointsOfInterest } from './usePointsOfInterest';
import { useSelectedPoi } from './useSelectedPoi';
import { usePoiDomainObject } from './usePoiDomainObject';

type RowType = {
  id: string;
  poi: PointOfInterest<unknown>;
};

/**
 * A filter for Points of interests
 */
export type PoiFilter = {
  /**
   * Checks if the PoI title or ID contains the string
   */
  contains: string;
};

export type PoiListProps = {
  /**
   * Callback to be called when a row is clicked. (The selected point of interest will be changed implicitly)
   */
  onRowClick?: (poi: PointOfInterest<unknown>) => void;
  /**
   * A filter to be applied to the points of interest. Not used if `values` are specified
   */
  filter?: PoiFilter;
  /**
   * The max number of PoIs to show before the user must click "show more", loading the same
   * amount of PoIs again
   */
  pageLimit?: number;
  /**
   * Manually specify values to show in the list. `filter` is not applied if this is specified
   */
  values?: Array<PointOfInterest<unknown>>;
};

/**
 * A list for visualizing points of interest (Pois)
 */
export const PoiList = ({
  onRowClick,
  filter,
  pageLimit = Infinity,
  values
}: PoiListProps): ReactNode => {
  const { t } = useTranslation();

  const pois = usePointsOfInterest();
  const selectedPoi = useSelectedPoi();

  const [currentLimit, setCurrentLimit] = useState<number>(pageLimit);

  const filteredPois = useFilterPointsOfInterest(pois, filter);
  const relevantPois = values ?? filteredPois;

  const hasMoreData = relevantPois.length > currentLimit;

  const poiObject = usePoiDomainObject();

  const rowData = useMemo(
    () =>
      take(relevantPois, currentLimit).map((poi) => ({
        id: JSON.stringify(poi.id),
        name: poi.properties.title ?? JSON.stringify(poi.id),
        poi
      })),
    [relevantPois, currentLimit, filter]
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

    setCurrentLimit((lastLimit) => Math.min(relevantPois.length, lastLimit + pageLimit));
  }, [relevantPois, setCurrentLimit, hasMoreData, pageLimit]);

  return (
    <Flex direction="column" alignContent="center">
      <DataGrid<RowType>
        onRowClick={(row) => {
          poiObject?.setSelectedPointOfInterest(row.row.poi as PointOfInterest<unknown>);
          onRowClick?.(row.row.poi as PointOfInterest<unknown>);
        }}
        columns={columns}
        data={rowData}
        selectedRows={[JSON.stringify(selectedPoi?.id)]}
        pagination={false}
        disableColumnResize
        disableRowStripes
      />
      <Flex direction="row" gap={16} justifyContent="center" alignContent="center">
        {hasMoreData && <Button onClick={handleShowMoreCallback}>{t({ key: 'SHOW_MORE' })}</Button>}
      </Flex>
    </Flex>
  );
};
