import React, { useEffect, useMemo, useState } from 'react';

import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';
import uniqBy from 'lodash/uniqBy';

import { Loading } from 'components/loading';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellInspectSelectedWellbores } from 'modules/wellInspect/hooks/useWellInspect';
import { BooleanSelection } from 'modules/wellInspect/types';
import { useMeasurementsQuery } from 'modules/wellSearch/hooks/useMeasurementsQuery';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import {
  MeasurementChartData,
  Wellbore,
  WellboreId,
} from 'modules/wellSearch/types';

import { formatChartData } from '../utils';

import { CompareView } from './CompareView/CompareView';
import { BulkActionsWrapper, WellCentricViewWrapper } from './elements';
import { WellCentricBulkActions } from './WellCentricBulkActions';
import WellCentricCard from './WellCentricCard';

type Props = {
  geomechanicsCurves: string[];
  ppfgCurves: string[];
  otherTypes: string[];
  pressureUnit: string;
  measurementReference: string;
};

type WellboreChartData = {
  wellbore: Wellbore;
  chartData: MeasurementChartData[];
};

export const WellCentricView: React.FC<Props> = ({
  geomechanicsCurves,
  ppfgCurves,
  otherTypes,
  pressureUnit,
  measurementReference,
}) => {
  const { data, isLoading } = useMeasurementsQuery();

  const { data: config } = useWellConfig();

  const selectedInspectWellbores = useWellInspectSelectedWellbores();

  const userPreferredUnit = useUserPreferencesMeasurement();

  const [wellboreChartData, setWellboreChartData] = useState<
    WellboreChartData[]
  >([]);

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

  const updateChartData = () => {
    if (isUndefined(data)) return;
    const filteredChartData = selectedInspectWellbores
      .map((wellbore) => ({
        wellbore,
        chartData: formatChartData(
          data[wellbore.id],
          geomechanicsCurves,
          ppfgCurves,
          otherTypes,
          measurementReference,
          pressureUnit.toLowerCase(),
          userPreferredUnit,
          config
        ),
      }))
      .filter((row) => !isEmpty(row.chartData));
    setWellboreChartData(filteredChartData);
  };

  useEffect(() => {
    setChartRendering(true);
    // Use timeout to display loader before app get freezed with chart rendering
    setTimeout(() => {
      updateChartData();
      setTimeout(() => {
        // Use timeout to avoid hiding loader before chart renders
        setChartRendering(false);
      }, 100);
    }, 1000);
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

  return (
    <>
      {chartRendering && <Loading />}
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
