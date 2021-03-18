import React from 'react';
import moment from 'moment';
import { Icon, Button, Tooltip } from '@cognite/cogs.js';
import { TimeseriesChart } from '@cognite/data-exploration';
import { Timeseries } from '@cognite/sdk';
import { useAssetTimeseresSearch } from 'hooks/useSearch';
import styled from 'styled-components/macro';
import { useHistory } from 'react-router-dom';

export const SearchResultTable = ({
  query,
  onTimeseriesClick,
}: {
  query: string;
  onTimeseriesClick: (timeseries: Timeseries) => void;
}) => {
  const history = useHistory();

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
          <AssetItem>
            <Row>
              <div style={{ padding: 5 }}>
                <Icon type="ResourceAssets" />
              </div>
              <strong style={{ marginLeft: 10 }}>{asset.name}</strong>
              <span style={{ marginLeft: 10, flexGrow: 2 }}>
                {asset.description}
              </span>
              <Tooltip content="P&amp;IDs">
                <Button
                  variant="ghost"
                  icon="SearchDocuments"
                  onClick={() => history.push(`/files/${asset.id}`)}
                />
              </Tooltip>
              <AssetCount>{ts.length} </AssetCount>
            </Row>
            <Row>
              <TSList>
                {ts.map((t) => (
                  <TSItem key={t.id}>
                    <Row>
                      <div style={{ padding: 5 }}>
                        <Icon type="ResourceTimeseries" />
                      </div>
                      <span>{t.name}</span>
                      <span>{t.description}</span>
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

                      <Button
                        type="link"
                        style={{ padding: 5 }}
                        onClick={() => onTimeseriesClick(t)}
                      >
                        <Icon type="Plus" />
                      </Button>
                    </Row>
                  </TSItem>
                ))}
              </TSList>
            </Row>
          </AssetItem>
        </li>
      ))}
    </AssetList>
  );
};

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const AssetList = styled.ul`
  height: 100%;
  overflow: auto;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const AssetItem = styled.div`
  border: 1px solid var(--cogs-greyscale-grey4);
  border-radius: 5px;
  margin-bottom: 10px;
  padding: 10px 15px 0px 15px;
`;

const AssetCount = styled.span`
  border: 1px solid var(--cogs-greyscale-grey4);
  border-radius: 5px;
  float: right;
  padding: 5px;
`;

const TSList = styled.ul`
  width: 100%;
  padding: 0;
  margin: 10px 0 10px 0;
  list-style: none;
`;

const TSItem = styled.li`
  border-radius: 5px;
  :nth-child(odd) {
    background-color: var(--cogs-greyscale-grey2);
  }
`;
