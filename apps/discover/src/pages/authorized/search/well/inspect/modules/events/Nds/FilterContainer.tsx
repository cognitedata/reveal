import { useMemo, useEffect, FC } from 'react';
import { useDispatch } from 'react-redux';

import countBy from 'lodash/countBy';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import set from 'lodash/set';
import uniq from 'lodash/uniq';

import { CogniteEvent } from '@cognite/sdk';

import { ExtraLabels } from 'components/filters/interfaces';
import { NOT_AVAILABLE } from 'constants/empty';
import { inspectTabsActions } from 'modules/inspectTabs/actions';
import { useFilterDataNds } from 'modules/inspectTabs/selectors';

import { hasCategoryFilterFulfilled } from '../common';
import { accessors } from '../constants';
import { FilterCol } from '../elements';

import { NdsSelectFilter } from './components/filters/NdsSelectFilter';
import { NdsFilterContainer, NdsFilterRow } from './elements';

interface Props {
  events: CogniteEvent[];
  filteredEvents: CogniteEvent[];
  onChangeFilteredEvents: (events: CogniteEvent[]) => void;
}

const convertToExtraLabels = (valuesMap: { [key: string]: number }) => {
  const convertedValues = {};
  Object.keys(valuesMap).forEach((key) =>
    set(convertedValues, key, `${key ? '' : NOT_AVAILABLE}(${valuesMap[key]})`)
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
    convertToExtraLabels(countBy(filteredEvents, accessor)),
  ];
};

const FilterContainer: FC<Props> = ({
  events,
  filteredEvents,
  onChangeFilteredEvents,
}) => {
  const dispatch = useDispatch();

  const [riskTypesAll, riskTypesAllExtraLabels] = useMemo(
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

  const { riskType, severity, probability } = useFilterDataNds();

  useEffect(() => {
    dispatch(inspectTabsActions.setNdsRiskType(riskTypesAll));
    dispatch(inspectTabsActions.setNdsSeverity(severityAll));
    dispatch(inspectTabsActions.setNdsProbability(probabilityAll));

    // Trigger on initial render to select all available options.
  }, []);

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
    <NdsFilterContainer>
      <NdsFilterRow>
        <FilterCol span={4}>
          <NdsSelectFilter
            title="Risk Type"
            allOptions={riskTypesAll}
            selectedOptions={riskType}
            extraLabels={riskTypesAllExtraLabels}
            onValueChange={(values) =>
              dispatch(inspectTabsActions.setNdsRiskType(values))
            }
          />
        </FilterCol>
        <FilterCol span={4}>
          <NdsSelectFilter
            title="Severity"
            allOptions={severityAll}
            selectedOptions={severity}
            extraLabels={severityAllExtraLabels}
            onValueChange={(values) =>
              dispatch(inspectTabsActions.setNdsSeverity(values))
            }
            showMinMaxFooter
          />
        </FilterCol>
        <FilterCol span={4}>
          <NdsSelectFilter
            title="Probability"
            allOptions={probabilityAll}
            selectedOptions={probability}
            extraLabels={probabilityAllExtraLabels}
            onValueChange={(values) =>
              dispatch(inspectTabsActions.setNdsProbability(values))
            }
            showMinMaxFooter
          />
        </FilterCol>
      </NdsFilterRow>
    </NdsFilterContainer>
  );
};

export default FilterContainer;
