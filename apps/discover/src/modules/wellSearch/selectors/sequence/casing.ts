import { useMemo } from 'react';

import capitalize from 'lodash/capitalize';
import get from 'lodash/get';
import sortBy from 'lodash/sortBy';
import { UnitConverterItem } from 'utils/units';

import { LOG_CASING, LOG_WELLS_CASING_NAMESPACE } from 'constants/logging';
import { FEET } from 'constants/units';
import { useMetricLogger, TimeLogStages } from 'hooks/useTimeLog';
import { useUserPreferencesMeasurement } from 'hooks/useUserPreferences';
import { useWellInspectSelectedWells } from 'modules/wellInspect/hooks/useWellInspect';
import { useSelectedWellboresCasingsQuery } from 'modules/wellSearch/hooks/useSelectedWellboresCasingsQuery';
import { convertObject } from 'modules/wellSearch/utils';
import { CasingData } from 'pages/authorized/search/well/inspect/modules/casing/interfaces';

import { casingAccessorsToFixedDecimal } from './constants';

export const useSelectedWellboresCasingsData = () => {
  const wells = useWellInspectSelectedWells();
  const [startPreparationTimer, stopPreparationTimer] = useMetricLogger(
    LOG_CASING,
    TimeLogStages.Preperation,
    LOG_WELLS_CASING_NAMESPACE
  );

  const { data, isLoading } = useSelectedWellboresCasingsQuery();

  return useMemo(() => {
    const tempData: CasingData[] = [];
    if (isLoading || !data) {
      return { isLoading: true, casings: [] };
    }
    startPreparationTimer();
    wells.forEach((well) => {
      if (!well.wellbores) return;
      well.wellbores.forEach((wellbore) => {
        const casings = data[wellbore.id];

        const casingNames: string[] = [];
        let topMD = 0;
        let bottomMD = 0;
        let odMin = 0; // minimum outer diameter
        let odMax = 0; // maximum outer diameter
        let idMin = 0; // minimum inner diameter
        let mdUnit = FEET;
        let odUnit = 'in';
        let idUnit = 'in';

        sortBy(casings, (casing) => {
          return Number(get(casing, 'metadata.assy_original_md_base', '0'));
        }).forEach((row) => {
          if (row.metadata) {
            casingNames.push(
              capitalize(row.metadata.assy_name).replace(' casing', '')
            );
            if (
              topMD === 0 ||
              Number(row.metadata.assy_original_md_top) < topMD
            ) {
              topMD = Number(row.metadata.assy_original_md_top);
            }
            if (
              bottomMD === 0 ||
              Number(row.metadata.assy_original_md_base) > bottomMD
            ) {
              bottomMD = Number(row.metadata.assy_original_md_base);
            }
            if (
              odMin === 0 ||
              (Number(row.metadata.assy_size) &&
                Number(row.metadata.assy_size) < odMin)
            ) {
              odMin = Number(row.metadata.assy_size);
            }
            if (odMax === 0 || Number(row.metadata.assy_size) > odMax) {
              odMax = Number(row.metadata.assy_size);
            }
            if (
              idMin === 0 ||
              (Number(row.metadata.assy_min_inside_diameter) &&
                Number(row.metadata.assy_min_inside_diameter) < idMin)
            ) {
              idMin = Number(row.metadata.assy_min_inside_diameter);
            }
          }
          row.columns.forEach((column) => {
            if (column.name === 'comp_md_top') {
              mdUnit = get(column, 'metadata.unit', mdUnit);
            }
            if (column.name === 'comp_body_outside_diameter') {
              odUnit = get(column, 'metadata.unit', odUnit);
            }
            if (column.name === 'comp_body_inside_diameter') {
              idUnit = get(column, 'metadata.unit', idUnit);
            }
          });
        });

        if (topMD && bottomMD) {
          tempData.push({
            wellName: well.name,
            wellboreName: wellbore.name || wellbore.description || '',
            id: wellbore.id,
            topMD: Math.round(topMD),
            bottomMD: Math.round(bottomMD),
            odMin,
            odMax,
            idMin,
            mdUnit,
            odUnit,
            idUnit,
            casingNames: casingNames.join(', '),
            casings,
          });
        }
      });
    });
    stopPreparationTimer({
      noOfWellbores: Object.keys(data).length,
    });
    return { casings: tempData, isLoading: false };
  }, [wells, isLoading, data, startPreparationTimer, stopPreparationTimer]);
};

export const useCasingsForTable = () => {
  const { casings, isLoading } = useSelectedWellboresCasingsData();
  const { data: preferredUnit } = useUserPreferencesMeasurement();
  return useMemo(() => {
    const casingList = casings.map((casingdata) =>
      convertObject(casingdata)
        .changeUnits(getCasingUnitChangeAccessors(preferredUnit))
        .toFixedDecimals(casingAccessorsToFixedDecimal)
        .get()
    );
    return { casings: casingList, isLoading };
  }, [casings, isLoading, preferredUnit]);
};

export const getCasingUnitChangeAccessors = (
  toUnit?: string
): UnitConverterItem[] =>
  toUnit
    ? [
        {
          id: 'id',
          accessor: 'topMD',
          fromAccessor: 'mdUnit',
          to: toUnit,
        },
        {
          id: 'id',
          accessor: 'bottomMD',
          fromAccessor: 'mdUnit',
          to: toUnit,
        },
      ]
    : [];
