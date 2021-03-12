import React from 'react';
import moment from 'moment';
import { Icon, Button } from '@cognite/cogs.js';
import { TimeseriesChart } from '@cognite/data-exploration';
import { Timeseries } from '@cognite/sdk';
import { useAssetTimeseresSearch } from 'hooks/useSearch';
import styled from 'styled-components/macro';

export const SearchResultTable = ({
  query,
  onTimeseriesClick,
}: {
  query: string;
  onTimeseriesClick: (timeseries: Timeseries) => void;
}) => {
  const {
    data: assets = [],
    isFetching,
    isFetched,
    isError,
  } = useAssetTimeseresSearch(query, true);

  if (isError) {
    return <Icon type="XLarge" />;
  }

  if (isFetching && !isFetched) {
    return <Icon type="Loading" />;
  }

  if (assets.length === 0) {
    return null;
  }

  const sparklineStartDate = moment()
    .subtract(1, 'years')
    .startOf('day')
    .toDate();

  const sparklineEndDate = moment().endOf('day').toDate();

  return (
    <AssetList>
      {assets.map(({ asset, ts }) => (
        <li key={asset.id}>
          <Icon type="ResourceAssets" />
          <strong style={{ marginLeft: 10 }}>{asset.name}</strong>
          <span style={{ marginLeft: 10 }}>{asset.description}</span>
          <TSList>
            {ts.map((t) => (
              <li key={t.id}>
                <p>
                  <Icon type="ResourceTimeseries" />
                  {t.name}
                </p>
                <p>{t.description}</p>
                <TimeseriesChart
                  height={65}
                  showSmallerTicks
                  timeseriesId={t.id}
                  numberOfPoints={100}
                  showAxis="horizontal"
                  timeOptions={[]}
                  showContextGraph={false}
                  showPoints={false}
                  enableTooltip={false}
                  showGridLine="none"
                  minRowTicks={2}
                  dateRange={[sparklineStartDate, sparklineEndDate]}
                />
                <div>
                  <Button type="link" onClick={() => onTimeseriesClick(t)}>
                    <Icon type="Plus" />
                  </Button>
                </div>
              </li>
            ))}
          </TSList>
        </li>
      ))}
    </AssetList>
  );
};

const AssetList = styled.ul`
  height: 100%;
  overflow: auto;
  list-style: none;
  padding: 0 10px;
  li {
    border-bottom: 1px solid rgb(232, 232, 232);
    margin-bottom: 6px;
    paddding-bottom: 6px;
  }
`;

const TSList = styled.ul`
  list-style: none;
  li {
    display: flex;
    flex-direction: row;
  }
  .cogs-icon {
    margin: 0 10px;
  }
`;
