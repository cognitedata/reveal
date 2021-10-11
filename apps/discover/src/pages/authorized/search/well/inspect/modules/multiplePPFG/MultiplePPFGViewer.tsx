import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import get from 'lodash/get';
import uniq from 'lodash/uniq';
import { Data } from 'plotly.js';

import { Collapse } from '@cognite/cogs.js';
import { Sequence } from '@cognite/sdk';

import { ArrayElement } from '_helpers/type';
import { CheckBoxes } from 'components/filters/CheckBoxes/CheckBoxes';
import { WhiteLoader } from 'components/loading';
import { useWellConfig } from 'modules/wellSearch/hooks/useWellConfig';
import { usePPFGData } from 'modules/wellSearch/selectors/sequence/ppfg';
import { convertToPlotly as convertFITToPlotly } from 'modules/wellSearch/utils/fit';
import { convertToPlotly as convertLOTToPlotly } from 'modules/wellSearch/utils/lot';
import { convertToPlotly as convertPPFGToPlotly } from 'modules/wellSearch/utils/ppfg';

import { EMPTY_CHART_DATA_MESSAGE } from '../../constants';
import Chart from '../common/Chart/Chart';
import { MessageWrapper } from '../common/elements';
import ValueSelector from '../common/ValueSelector';

import {
  ContainerRow,
  FilterColumn,
  ChartColumn,
  ChartHolder,
} from './elements';
import {
  FilterInputMap,
  FilterResultMap,
  SelectAllFilterOptionsMap,
  getIntersectCurves,
  getFilteredPPFGsData,
  getUniquePressureCurves,
  getUniqueTypes,
  getWellboreIdNameMap,
  getCheckboxItemMap,
} from './utils/utils';

const { Panel } = Collapse;

const filters = [
  {
    key: 'otherDataTypes',
    name: 'Other Data Types',
  },
  {
    key: 'wellbores',
    name: 'Wellbores',
  },
  {
    key: 'ppfgTypes',
    name: 'PPFG Types',
  },
  {
    key: 'curves',
    name: 'Curves',
  },
];

const unitSelections = [
  { id: 1, value: 'ppg', title: 'PPG', default: true },
  { id: 2, value: 'psi', title: 'PSI' },
  { id: 3, value: 'sg', title: 'SG' },
];

type Props = {
  sequences: (Sequence & { sequenceType: string })[];
};

const defaultPressureUnit = 'ppg';

export const MultiplePPFGViewer: React.FC<Props> = ({ sequences }) => {
  const { t } = useTranslation();
  const [pressureUnit, setPressureUnit] = useState<string>(defaultPressureUnit);
  const { data: config } = useWellConfig();
  const defaultCurves = config?.ppfg?.defaultCurves;

  const ppfgSequences = useMemo(
    () => sequences.filter((row) => row.sequenceType === 'PPFG'),
    [sequences]
  );

  const otherSequences = useMemo(
    () => sequences.filter((row) => row.sequenceType !== 'PPFG'),
    [sequences]
  );

  const otherDataTypes = useMemo(
    () => uniq(otherSequences.map((row) => row.sequenceType)),
    [otherSequences]
  );

  const [selectedFilters, setSelectedFilters] = useState<FilterResultMap>({
    otherDataTypes,
  });

  const { isLoading, ppfgsData } = usePPFGData(ppfgSequences);

  const tvdColumn = get(config, 'ppfg.tvdColumn', 'TVD');

  const source = useMemo(() => {
    if (isLoading) {
      return [];
    }
    return [...ppfgsData.map((row) => row.sequence), ...otherSequences];
  }, [ppfgsData, otherSequences, isLoading]);

  const wellboreIdNameMap = useMemo(() => {
    if (source.length === 0) {
      return undefined;
    }
    return getWellboreIdNameMap(source);
  }, [source]);

  const checkboxItemMap = useMemo(() => {
    if (source.length === 0) {
      return [];
    }
    return getCheckboxItemMap(source);
  }, [ppfgsData, otherSequences, isLoading]);

  /**
   * Unique wellbore name list
   */
  const uniqWellbores = useMemo(
    () => (wellboreIdNameMap ? Object.values(wellboreIdNameMap) : undefined),
    [wellboreIdNameMap]
  );

  /**
   * Maintain selected wellbores from filters, initially all selected
   */
  if (uniqWellbores && !selectedFilters.wellbores) {
    setSelectedFilters((previouslySelectedFilters) => ({
      ...previouslySelectedFilters,
      wellbores: uniqWellbores,
    }));
  }

  const uniqTypes = useMemo(
    () =>
      !isLoading && selectedFilters.wellbores
        ? getUniqueTypes(ppfgsData, selectedFilters)
        : undefined,
    [ppfgsData, isLoading, selectedFilters]
  );

  if (uniqTypes && !selectedFilters.ppfgTypes) {
    setSelectedFilters((previouslySelectedFilters) => ({
      ...previouslySelectedFilters,
      ppfgTypes: uniqTypes,
    }));
  }

  const filteredPPFGsWithData = useMemo(
    () =>
      !isLoading && selectedFilters.wellbores && selectedFilters.ppfgTypes
        ? getFilteredPPFGsData(ppfgsData, {
            ...selectedFilters,
            uniqTypes: uniqTypes as string[],
          })
        : undefined,
    [ppfgsData, isLoading, selectedFilters, uniqTypes]
  );

  const uniqCurves = useMemo(() => {
    const curves = filteredPPFGsWithData
      ? getUniquePressureCurves(filteredPPFGsWithData)
      : undefined;

    // mechanism to display default selected curves on top
    const defaultUniqCurves = getIntersectCurves(curves, defaultCurves);
    return curves
      ? [
          ...defaultUniqCurves,
          ...curves.filter((curve) => !defaultUniqCurves.includes(curve)),
        ]
      : undefined;
  }, [filteredPPFGsWithData]);

  if (uniqCurves && !selectedFilters.curves) {
    const defaultUniqCurves = getIntersectCurves(uniqCurves, defaultCurves);
    setSelectedFilters((state) => ({
      ...state,
      curves: defaultUniqCurves,
    }));
  }

  if (isLoading) {
    return <WhiteLoader />;
  }

  const filterData: FilterInputMap = {
    otherDataTypes,
    wellbores: checkboxItemMap,
    ppfgTypes: uniqTypes as string[],
    curves: uniqCurves as string[],
  };

  const selectAllFilterOptions: SelectAllFilterOptionsMap = {
    wellbores: true,
  };

  const onFilterChange = (type: string, vals: string[]) => {
    setSelectedFilters((state) => ({ ...state, [type]: vals }));
  };

  let ppfgChartData = { xAxisName: '', yAxisName: '', chartData: [] as Data[] };
  if (filteredPPFGsWithData && selectedFilters.curves) {
    ppfgChartData = convertPPFGToPlotly(
      filteredPPFGsWithData,
      selectedFilters.curves as string[],
      tvdColumn,
      pressureUnit
    );

    sequences.forEach((sequence) => {
      if (
        selectedFilters.otherDataTypes.includes(sequence.sequenceType) &&
        wellboreIdNameMap &&
        selectedFilters.wellbores.includes(
          wellboreIdNameMap[sequence.assetId as number]
        )
      ) {
        let convertedData;
        if (sequence.sequenceType === 'FIT') {
          convertedData = convertFITToPlotly(
            sequence,
            config?.fit?.fieldInfo,
            pressureUnit
          );
        }
        if (sequence.sequenceType === 'LOT') {
          convertedData = convertLOTToPlotly(
            sequence,
            config?.lot?.fieldInfo,
            pressureUnit
          );
        }
        if (convertedData) {
          ppfgChartData.chartData.push(convertedData);
        }
      }
    });
  }

  const onUnitChange = (unit: string) => {
    setPressureUnit(unit);
  };

  return (
    <ContainerRow>
      <FilterColumn>
        <Collapse defaultActiveKey={filters.map((filter) => filter.key)}>
          {filters
            .filter((filter) => filterData[filter.key])
            .map((filter) => (
              <Panel header={filter.name} key={filter.key}>
                <CheckBoxes<ArrayElement<typeof filterData[number]>>
                  options={filterData[filter.key]}
                  selectedValues={selectedFilters[filter.key]}
                  enableSelectAll={selectAllFilterOptions[filter.key]}
                  onValueChange={(vals: string[]) =>
                    onFilterChange(filter.key, vals)
                  }
                />
              </Panel>
            ))}
        </Collapse>
      </FilterColumn>
      <ChartColumn>
        {ppfgChartData && ppfgChartData.chartData.length > 0 ? (
          <>
            <ValueSelector
              selections={unitSelections}
              onChange={onUnitChange}
              label="Pressure Unit"
              showOutline
            />

            <ChartHolder>
              <Chart
                data={ppfgChartData.chartData}
                axisNames={{
                  x: ppfgChartData.xAxisName,
                  y: ppfgChartData.yAxisName,
                }}
                axisAutorange={{
                  y: 'reversed',
                }}
                title=""
                autosize
                showLegend
              />
            </ChartHolder>
          </>
        ) : (
          <MessageWrapper>{t(EMPTY_CHART_DATA_MESSAGE)}</MessageWrapper>
        )}
      </ChartColumn>
    </ContainerRow>
  );
};
