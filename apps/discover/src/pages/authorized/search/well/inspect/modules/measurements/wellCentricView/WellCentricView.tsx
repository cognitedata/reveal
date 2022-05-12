import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import uniqBy from 'lodash/uniqBy';

import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { NoDataAvailable } from 'components/Charts/common/NoDataAvailable';
import { Loading } from 'components/Loading';
import { DepthMeasurementUnit, PressureUnit } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { useWellInspectSelectedWellbores } from 'modules/wellInspect/hooks/useWellInspect';
import { BooleanSelection } from 'modules/wellInspect/types';
import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQuery';
import {
  WellboreId,
  WellboreChartData,
  WellboreProcessedData,
} from 'modules/wellSearch/types';

import {
  formatChartData,
  extractChartDataFromProcessedData,
  extractWellboreErrorsFromProcessedData,
} from '../utils';

import { CompareView } from './CompareView/CompareView';
import { BulkActionsWrapper, WellCentricViewWrapper } from './elements';
import { WellCentricBulkActions } from './WellCentricBulkActions';
import WellCentricCard from './WellCentricCard';

export type Props = {
  geomechanicsCurves: DepthMeasurementColumn[];
  ppfgCurves: DepthMeasurementColumn[];
  otherTypes: DepthMeasurementColumn[];
  pressureUnit: PressureUnit;
  measurementReference: DepthMeasurementUnit;
};

export const WellCentricView: React.FC<Props> = ({
  geomechanicsCurves,
  ppfgCurves,
  otherTypes,
  pressureUnit,
  measurementReference,
}) => {
  const dispatch = useDispatch();

  const { data, isLoading } = useMeasurementsQuery();

  const selectedInspectWellbores = useWellInspectSelectedWellbores();

  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

  const [wellboreChartData, setWellboreChartData] = useState<
    WellboreChartData[]
  >([]);

  const [wellboreProcessedData, setWellboreProcessedData] =
    useState<WellboreProcessedData[]>();

  const [chartRendering, setChartRendering] = useState<boolean>(false);

  const [selectedWellboresMap, setSelectedWellboresMap] =
    useState<BooleanSelection>({});

  const [compare, setCompare] = useState<boolean>(false);

  const onToggle = (id: WellboreId) => {
    setSelectedWellboresMap((state) => ({
      ...state,
      [id]: !state[id],
    }));
  };

  const handleDeselectAll = () => {
    setSelectedWellboresMap({});
    setCompare(false);
  };

  /**
   * Extract chart data from processed data and set to state
   */
  useEffect(() => {
    if (!wellboreProcessedData) return;
    setWellboreChartData(
      extractChartDataFromProcessedData(wellboreProcessedData)
    );
  }, [wellboreProcessedData]);

  /**
   * Extract errors from processed data and dispath to state
   */
  useEffect(() => {
    if (!wellboreProcessedData) return;
    dispatch(
      inspectTabsActions.setErrors(
        extractWellboreErrorsFromProcessedData(wellboreProcessedData)
      )
    );
  }, [wellboreProcessedData]);

  const updateChartData = useCallback(() => {
    if (isUndefined(data) || !userPreferredUnit) return;
    const wellboreProcessedData = selectedInspectWellbores.map((wellbore) => ({
      wellbore,
      proccessedData: formatChartData(
        data[wellbore.matchingId || ''], // Matching id is not optional in sdkv3. this is due to handling two sdk's
        geomechanicsCurves,
        ppfgCurves,
        otherTypes,
        pressureUnit,
        userPreferredUnit
      ),
    }));
    setWellboreProcessedData(wellboreProcessedData);
  }, [
    JSON.stringify(data),
    isLoading,
    selectedInspectWellbores,
    pressureUnit,
    geomechanicsCurves,
    ppfgCurves,
    measurementReference,
    otherTypes,
    userPreferredUnit,
  ]);

  useEffect(() => {
    setChartRendering(true);
    // Use timeout to display loader before app get freezed with chart rendering
    const timer = setTimeout(() => {
      updateChartData();
      setTimeout(() => {
        // Use timeout to avoid hiding loader before chart renders
        setChartRendering(false);
      }, 100);
    }, 1000);

    return () => clearTimeout(timer);
  }, [updateChartData]);

  const wellCards = useMemo(
    () =>
      wellboreChartData.map((row) => (
        <WellCentricCard
          selected={selectedWellboresMap[row.wellbore.id]}
          wellbore={row.wellbore}
          key={row.wellbore.id}
          chartData={row.chartData}
          axisNames={{
            x: `Pressure (${pressureUnit.toLowerCase()})`,
            x2: 'Angle (deg)',
            y: `${measurementReference} (${userPreferredUnit})`,
          }}
          onToggle={onToggle}
        />
      )),
    [wellboreChartData, selectedWellboresMap]
  );

  const selectedWellbores = useMemo(
    () =>
      selectedInspectWellbores.filter(
        (wellbore) => selectedWellboresMap[wellbore.id]
      ),
    [selectedWellboresMap]
  );

  const selectedWellsCounts = useMemo(
    () => uniqBy(selectedWellbores, 'wellId').length,
    [selectedWellbores]
  );

  if (chartRendering) {
    return <Loading />;
  }

  if (!chartRendering && isEmpty(wellboreChartData)) return <NoDataAvailable />;

  return (
    <>
      <WellCentricViewWrapper visible={!chartRendering}>
        {wellCards}
      </WellCentricViewWrapper>
      {!isEmpty(selectedWellbores) && (
        <BulkActionsWrapper>
          <WellCentricBulkActions
            wellsCount={selectedWellsCounts}
            wellboresCount={selectedWellbores.length}
            handleDeselectAll={handleDeselectAll}
            compare={() => setCompare(true)}
          />
        </BulkActionsWrapper>
      )}
      {compare && (
        <CompareView
          onBack={() => setCompare(false)}
          wellbores={selectedWellbores}
        />
      )}
    </>
  );
};

export default WellCentricView;
