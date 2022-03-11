import { useMemo, useEffect, FC } from 'react';
import { useDispatch } from 'react-redux';

import countBy from 'lodash/countBy';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import set from 'lodash/set';
import uniq from 'lodash/uniq';

import { CogniteEvent } from '@cognite/sdk';

import { CheckBoxes } from 'components/filters';
import { ExtraLabels } from 'components/filters/interfaces';
import { filterDataActions } from 'modules/filterData/actions';
import { useFilterDataNds } from 'modules/filterData/selectors';

import { hasCategoryFilterFulfilled } from '../common';
import { accessors } from '../constants';
import { FilterCol, NdsFilterContent } from '../elements';

import {
  NdsFilterContainer,
  NdsFilterItemWrapper,
  NdsFilterRow,
} from './elements';

interface Props {
  events: CogniteEvent[];
  filteredEvents: CogniteEvent[];
  onChangeFilteredEvents: (events: CogniteEvent[]) => void;
}

const convertToExtraLables = (valuesMap: { [key: string]: number }) => {
  const convertedValues = {};
  Object.keys(valuesMap).forEach((key) =>
    set(convertedValues, key, `(${valuesMap[key]})`)
  );
  return convertedValues;
};

const getOptionsList = (
  events: CogniteEvent[],
  filteredEvents: CogniteEvent[],
  accessor: string
): [string[], ExtraLabels] => {
  return [
    uniq(
      map(events, accessor).filter((item) => item !== (null || undefined))
    ).sort(),
    convertToExtraLables(countBy(filteredEvents, accessor)),
  ];
};

const FilterContainer: FC<Props> = ({
  events,
  filteredEvents,
  onChangeFilteredEvents,
}) => {
  const dispatch = useDispatch();

  const [riskTypesAll, risktableAllExtraLabels] = useMemo(
    () => getOptionsList(events, filteredEvents, accessors.RISK_TYPE),
    [events, filteredEvents]
  );

  const [severityAll, severityAllExtraLabels] = useMemo(
    () => getOptionsList(events, filteredEvents, accessors.SEVERITY),
    [events, filteredEvents]
  );

  const [probabilityAll, probabilityAllExtraLabels] = useMemo(
    () => getOptionsList(events, filteredEvents, accessors.PROBABILITY),
    [events, filteredEvents]
  );

  const minSeverity = useMemo(
    () => Math.min(...severityAll.map((n) => Number(n))),
    [severityAll]
  );

  const maxSeverity = useMemo(
    () => Math.max(...severityAll.map((n) => Number(n))),
    [severityAll]
  );

  const minProbability = useMemo(
    () => Math.min(...probabilityAll.map((n) => Number(n))),
    [severityAll]
  );

  const maxProbability = useMemo(
    () => Math.max(...probabilityAll.map((n) => Number(n))),
    [severityAll]
  );

  const { riskType, severity, probability } = useFilterDataNds();

  useEffect(() => {
    const localFilteredEvents = events.filter(
      (event) =>
        hasCategoryFilterFulfilled(event, accessors.RISK_TYPE, riskType) &&
        hasCategoryFilterFulfilled(event, accessors.SEVERITY, severity) &&
        hasCategoryFilterFulfilled(event, accessors.PROBABILITY, probability)
    );
    onChangeFilteredEvents(localFilteredEvents);
  }, [riskType, severity, probability, JSON.stringify(events)]);

  if (isEmpty(events)) {
    return null;
  }

  return (
    <NdsFilterContent>
      <NdsFilterContainer>
        <NdsFilterRow>
          <FilterCol span={8}>
            <NdsFilterItemWrapper>
              <CheckBoxes
                onValueChange={(vals: string[]) =>
                  dispatch(filterDataActions.setNdsRiskType(vals))
                }
                selectedValues={riskType}
                options={riskTypesAll}
                extraLabels={risktableAllExtraLabels}
                header={{ title: 'Risk Type' }}
                scrollable
              />
            </NdsFilterItemWrapper>
          </FilterCol>
          <FilterCol span={8}>
            <NdsFilterItemWrapper>
              <CheckBoxes
                onValueChange={(vals: string[]) =>
                  dispatch(filterDataActions.setNdsSeverity(vals))
                }
                selectedValues={severity}
                options={severityAll}
                extraLabels={severityAllExtraLabels}
                header={{
                  title: `Severity - ${minSeverity} least / ${maxSeverity} most`,
                  tooltip: `Severity Level of the risk. Values of ${minSeverity} through ${maxSeverity} with ${minSeverity} lowest`,
                }}
                scrollable
              />
            </NdsFilterItemWrapper>
          </FilterCol>
          <FilterCol span={8}>
            <NdsFilterItemWrapper>
              <CheckBoxes
                onValueChange={(vals: string[]) =>
                  dispatch(filterDataActions.setNdsProbability(vals))
                }
                selectedValues={probability}
                options={probabilityAll}
                extraLabels={probabilityAllExtraLabels}
                header={{
                  title: `Probability - ${minProbability} least / ${maxProbability} most`,
                  tooltip: `Probability Level of the risk. Values of ${minSeverity} through ${maxSeverity} with ${minSeverity} lowest`,
                }}
                scrollable
              />
            </NdsFilterItemWrapper>
          </FilterCol>
        </NdsFilterRow>
      </NdsFilterContainer>
    </NdsFilterContent>
  );
};

export default FilterContainer;
