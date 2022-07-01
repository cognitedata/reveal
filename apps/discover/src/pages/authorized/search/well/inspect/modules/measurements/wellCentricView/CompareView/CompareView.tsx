import { useMeasurementsQuery } from 'domain/wells/measurements0/internal/queries/useMeasurementsQuery';
import { Wellbore } from 'domain/wells/wellbore/internal/types';

import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';

import isEmpty from 'lodash/isEmpty';
import uniqBy from 'lodash/uniqBy';

import { DepthMeasurementColumn } from '@cognite/sdk-wells-v3';

import { BackButton } from 'components/Buttons';
import { OverlayNavigation } from 'components/OverlayNavigation';
import { PressureUnit, DepthMeasurementUnit } from 'constants/units';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { WellboreProcessedData } from 'modules/wellSearch/types';
import { FlexColumn } from 'styles/layout';

import {
  DEFAULT_MEASUREMENTS_REFERENCE,
  DEFAULT_PRESSURE_UNIT,
  // MEASUREMENTS_REFERENCES,
  PRESSURE_UNITS,
} from '../../constants';
import { GeomechanicsCurveFilter } from '../../filters/GeomechanicsCurveFilter';
import { OtherFilter } from '../../filters/OtherFilter';
import { PPFGCurveFilter } from '../../filters/PPFGCurveFilter';
import { UnitFilter } from '../../filters/UnitFilter';
import {
  formatChartData,
  getSelectedWellboresTitle,
  getSelectedWellsTitle,
  mapToCompareView,
  extractChartDataFromProcessedData,
  extractWellboreErrorsFromProcessedData,
} from '../../utils';

import CompareViewCard from './CompareViewCard';
import {
  Header,
  HeaderTitle,
  HeaderSubTitle,
  TopBar,
  CompareViewCardsWrapper,
} from './elements';

export type Props = {
  wellbores: Wellbore[];
  onBack: () => void;
};

export const CompareView: React.FC<Props> = ({ wellbores, onBack }) => {
  const dispatch = useDispatch();
  const wellsCounts = useMemo(
    () => uniqBy(wellbores, 'wellId').length,
    [wellbores]
  );

  const [geomechanicsCurves, setGeomechanicsCurves] = useState<
    DepthMeasurementColumn[]
  >([]);
  const [ppfgCurves, setPPFGCurves] = useState<DepthMeasurementColumn[]>([]);
  const [otherTypes, setOtherTypes] = useState<DepthMeasurementColumn[]>([]);
  const [pressureUnit, setPressureUnit] = useState<PressureUnit>(
    DEFAULT_PRESSURE_UNIT
  );
  const [measurementReference] = useState<DepthMeasurementUnit>(
    DEFAULT_MEASUREMENTS_REFERENCE
  );

  const [wellboreProcessedData, setWellboreProcessedData] =
    useState<WellboreProcessedData[]>();

  const { data } = useMeasurementsQuery();

  const { data: userPreferredUnit } = useUserPreferencesMeasurement();

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

  useEffect(() => {
    if (!data || isEmpty(data) || !userPreferredUnit) return;
    const wellboreProcessedData = wellbores.map((wellbore) => ({
      wellbore,
      proccessedData: formatChartData(
        data[wellbore.id] || [],
        geomechanicsCurves,
        ppfgCurves,
        otherTypes,
        pressureUnit,
        userPreferredUnit
      ),
    }));
    setWellboreProcessedData(wellboreProcessedData);
  }, [
    wellbores,
    JSON.stringify(data),
    pressureUnit,
    geomechanicsCurves,
    ppfgCurves,
    // measurementReference,
    otherTypes,
    userPreferredUnit,
  ]);

  const graphCards = useMemo(() => {
    if (!wellboreProcessedData) return [];
    const wellboreCharts = extractChartDataFromProcessedData(
      wellboreProcessedData
    );

    const groupedData = mapToCompareView(wellboreCharts);

    const charts: JSX.Element[] = [];

    const axisNames = {
      x: `Pressure (${pressureUnit.toLowerCase()})`,
      y: `${measurementReference} (${userPreferredUnit})`,
    };

    if (groupedData.x) {
      charts.push(
        <CompareViewCard
          title="Pore Pressure Fracture Gradient"
          key="compare-view-pressure-chart"
          chartData={groupedData.x}
          axisNames={axisNames}
        />
      );
    }

    if (groupedData.x2) {
      charts.push(
        <CompareViewCard
          title="Internal Friction Angle"
          key="compare-view-angle-chart"
          chartData={groupedData.x2}
          axisNames={axisNames}
        />
      );
    }
    return charts;
  }, [wellboreProcessedData]);

  return (
    <OverlayNavigation mount>
      <Header>
        <BackButton onClick={onBack} />
        <FlexColumn>
          <HeaderTitle>
            {getSelectedWellboresTitle(wellbores.length)}
          </HeaderTitle>
          <HeaderSubTitle>{getSelectedWellsTitle(wellsCounts)}</HeaderSubTitle>
        </FlexColumn>
      </Header>

      <TopBar>
        <GeomechanicsCurveFilter
          selectedCurves={geomechanicsCurves}
          onChange={setGeomechanicsCurves}
        />
        <PPFGCurveFilter selectedCurves={ppfgCurves} onChange={setPPFGCurves} />
        <OtherFilter selectedCurves={otherTypes} onChange={setOtherTypes} />
        <UnitFilter<PressureUnit>
          title="Pressure Unit:"
          selected={pressureUnit}
          options={PRESSURE_UNITS}
          onChange={setPressureUnit}
        />
        {/* <UnitFilter<DepthMeasurementUnit>
          title="Measurement reference:"
          selected={measurementReference}
          options={MEASUREMENTS_REFERENCES}
          onChange={setMeasurementReference}
        /> */}
      </TopBar>
      <CompareViewCardsWrapper>{graphCards}</CompareViewCardsWrapper>
    </OverlayNavigation>
  );
};
