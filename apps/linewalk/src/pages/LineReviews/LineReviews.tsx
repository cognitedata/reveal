import { Select, TextInput, Loader, Graphic } from '@cognite/cogs.js';
import { useAuthContext } from '@cognite/react-container';
import uniq from 'lodash/uniq';
import { LineReview, LineReviewStatus } from 'modules/lineReviews/types';
import React, { useContext } from 'react';
import { useHistory } from 'react-router';
import styled from 'styled-components';
import pickOnChangeOptionValue from 'utils/pickOnChangeOptionValue';
import shamefulPendingPromise from 'utils/shamefulPendingPromise';

import SiteContext from '../../components/SiteContext/SiteContext';
import { getLineReviews } from '../../modules/lineReviews/api';
import LineReviewStatuses from '../../modules/lineReviews/LineReviewStatuses';
import mapCapitalizedValueToOption from '../../utils/mapCapitalizedValueToOption';
import mapValueToOption from '../../utils/mapValueToOption';
import { useFetch } from '../../utils/useFetch';
import usePersistedQueryParamValue from '../../utils/usePersistedQueryParamValue';
import { LineReviewsWrapper, LoaderContainer } from '../elements';
import Statistic from '../Statistic';
import * as Styled from '../styled';

import LineReviewTable from './LineReviewTable';

const FiltersContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  > * {
    margin-right: 8px;
  }
  padding-bottom: 16px;
`;

const FilterContainer = styled.div`
  width: 300px;
`;

const DEFAULT_UNIT_OPTION = {
  label: 'All',
  value: '',
};

const DEFAULT_STATUS_OPTION = {
  label: 'All',
  value: '',
};

const DEFAULT_ASSIGNEE_OPTION = {
  label: 'All',
  value: '',
};

const uniqAssigneesFromLineReviews = (lineReviews: LineReview[]): string[] =>
  uniq(lineReviews.flatMap((lineReview) => lineReview.assignee));

enum QueryParameterKey {
  UNIT = 'unit',
  SEARCH = 'search',
  ASSIGNEE = 'assignee',
  STATUS = 'status',
}

const LineReviews: React.FC = () => {
  const history = useHistory();
  const { client } = useAuthContext();
  const {
    site,
    unit,
    setUnit,
    availableUnits,
    isLoading: areSitesOrUnitsLoading,
  } = useContext(SiteContext);

  const { isLoading, data: lineReviews } = useFetch(
    () =>
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      client && unit
        ? getLineReviews(client, site, unit)
        : shamefulPendingPromise<[]>(),
    [],
    [client, unit]
  );

  const [search, setSearch] = usePersistedQueryParamValue(
    isLoading,
    QueryParameterKey.SEARCH
  );

  const [status, setStatus] = usePersistedQueryParamValue(
    isLoading,
    QueryParameterKey.STATUS,
    (status) => LineReviewStatuses.includes(status)
  );

  const assignees = uniqAssigneesFromLineReviews(lineReviews ?? []);
  const [assignee, setAssignee] = usePersistedQueryParamValue(
    isLoading,
    QueryParameterKey.ASSIGNEE,
    (assignee: string) => assignees.includes(assignee)
  );

  const filteredLineReviews = lineReviews
    .filter(
      (lineReview) =>
        search.length === 0 ||
        lineReview.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((lineReview) => status.length === 0 || status === lineReview.status)
    .filter(
      (lineReview) => assignee.length === 0 || assignee === lineReview.assignee
    );

  if (areSitesOrUnitsLoading) {
    return (
      <LoaderContainer>
        <Loader infoTitle="Loading..." darkMode={false} />
      </LoaderContainer>
    );
  }

  const assigneeOptions = [
    DEFAULT_ASSIGNEE_OPTION,
    ...assignees.map(mapValueToOption),
  ];

  const statusOptions = [
    DEFAULT_STATUS_OPTION,
    ...LineReviewStatuses.map(mapCapitalizedValueToOption),
  ];

  const unitOptions = [
    DEFAULT_UNIT_OPTION,
    ...availableUnits.map(mapValueToOption),
  ];

  return (
    <LineReviewsWrapper>
      <Styled.StatisticsContainer>
        <Statistic
          number={lineReviews.length}
          title="Assigned Lines"
          body={`out of ${lineReviews.length} ISOs for Unit 03`}
        />
        <Statistic
          number={
            lineReviews.filter(
              (lineReview) => lineReview.status === LineReviewStatus.REVIEWED
            ).length
          }
          title="Under Review"
          body="Forwarded for onsite or remote check"
        />
        <Statistic
          number={
            lineReviews.filter(
              (lineReview) => lineReview.status === LineReviewStatus.COMPLETED
            ).length
          }
          title="Completed"
          body="Checked and validate onsite"
        />
      </Styled.StatisticsContainer>

      <div style={{ padding: 62 }}>
        <FiltersContainer>
          <FilterContainer>
            <Select
              title="Unit"
              value={mapValueToOption(unit)}
              onChange={pickOnChangeOptionValue(setUnit)}
              options={unitOptions}
            />
          </FilterContainer>
          <FilterContainer>
            <TextInput
              // className="filter-input"
              placeholder="Search"
              icon="Search"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
              }}
              fullWidth
            />
          </FilterContainer>

          <FilterContainer>
            <Select
              title="Status"
              value={mapCapitalizedValueToOption(status)}
              onChange={pickOnChangeOptionValue(setStatus)}
              options={statusOptions}
            />
          </FilterContainer>

          <FilterContainer>
            <Select
              title="Assignee"
              value={mapCapitalizedValueToOption(assignee)}
              onChange={pickOnChangeOptionValue(setAssignee)}
              options={assigneeOptions}
            />
          </FilterContainer>
        </FiltersContainer>

        {unit === '' && (
          <div className="cogs-table no-data">
            <Graphic type="Search" />
            <b>Select a unit first to list its lines</b>
            Use above filter to select a unit and to show all of its lines.
          </div>
        )}
        {unit !== '' && !areSitesOrUnitsLoading && !isLoading && (
          <LineReviewTable
            unit={unit}
            lineReviews={filteredLineReviews}
            onRowClick={(lineReview) => {
              history.push(
                `/LineReview/${lineReview.id}?site=${lineReview.site}&unit=${lineReview.unit}`
              );
            }}
          />
        )}
      </div>
    </LineReviewsWrapper>
  );
};

export default LineReviews;
