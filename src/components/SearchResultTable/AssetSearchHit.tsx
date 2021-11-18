import { useMemo } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import styled from 'styled-components';
import { Icon, Checkbox, Button, Colors } from '@cognite/cogs.js';
import DelayedComponent from 'components/DelayedComponent';
import { PnidButton } from 'components/SearchResultTable';
import { useInfiniteList, useAggregate } from '@cognite/sdk-react-query-hooks';
import { Asset, Timeseries } from '@cognite/sdk';
import {
  addTimeseries,
  covertTSToChartTS,
  removeTimeseries,
  updateSourceAxisForChart,
} from 'models/chart/updates';
import { calculateDefaultYAxis } from 'utils/axis';
import { trackUsage } from 'services/metrics';
import Highlighter from 'react-highlight-words';
import { useAddToRecentLocalStorage } from 'hooks/recently-used';
import { useRecoilState } from 'recoil';
import { chartAtom } from 'models/chart/atom';
import { AxisUpdate } from 'components/PlotlyChart';
import { removeIllegalCharacters } from 'utils/text';
import TimeseriesSearchResultItem from './TimeseriesSearchResultItem';

type Props = {
  asset: Asset;
  query?: string;
  isExact?: boolean;
};

export default function AssetSearchHit({ asset, query = '', isExact }: Props) {
  const sdk = useSDK();
  const [chart, setChart] = useRecoilState(chartAtom);
  const { addAssetToRecent } = useAddToRecentLocalStorage();

  const { data, hasNextPage, fetchNextPage } = useInfiniteList<Timeseries>(
    'timeseries',
    5,
    {
      assetIds: [asset.id],
    }
  );

  const { data: dataAmount } = useAggregate('timeseries', {
    assetIds: [asset.id],
  });

  const timeseries = useMemo(
    () =>
      data?.pages?.reduce(
        (accl, page) => accl.concat(page.items),
        [] as Timeseries[]
      ),
    [data]
  );

  const selectedExternalIds: undefined | string[] = chart?.timeSeriesCollection
    ?.map((t) => t.tsExternalId || '')
    .filter(Boolean);

  const handleTimeSeriesClick = async (ts: Timeseries) => {
    if (!chart) {
      return;
    }

    const tsToRemove = chart.timeSeriesCollection?.find(
      (t) => t.tsExternalId === ts.externalId
    );

    if (tsToRemove) {
      setChart((oldChart) => removeTimeseries(oldChart!, tsToRemove.id));
    } else {
      const newTs = covertTSToChartTS(ts, chart.id, []);
      setChart((oldChart) => addTimeseries(oldChart!, newTs));

      // Add to recentlyViewed assets and timeseries
      addAssetToRecent(asset.id, ts.id);

      // Calculate y-axis / range
      const range = await calculateDefaultYAxis({
        chart,
        sdk,
        timeSeriesExternalId: ts.externalId || '',
      });

      const axisUpdate: AxisUpdate = {
        id: newTs.id,
        type: 'timeseries',
        range,
      };

      // Update y axis when ready
      setChart((oldChart) =>
        updateSourceAxisForChart(oldChart!, { x: [], y: [axisUpdate] })
      );

      trackUsage('ChartView.AddTimeSeries', { source: 'search' });
    }
  };

  const searchResultElements = timeseries?.map((ts) => (
    <TimeseriesSearchResultItem
      key={ts.id}
      timeseries={ts}
      query={query}
      renderCheckbox={() => (
        <Checkbox
          onClick={(e) => {
            e.preventDefault();
            handleTimeSeriesClick(ts);
          }}
          name={`${ts.id}`}
          checked={selectedExternalIds?.includes(ts.externalId || '')}
        />
      )}
    />
  ));

  return (
    <AssetItem outline={isExact}>
      <Row>
        <InfoContainer>
          <ResourceNameWrapper>
            <Icon type="ResourceAssets" size={14} />
            <Highlighter
              highlightStyle={{
                backgroundColor: Colors['yellow-4'].alpha(0.4),
                marginLeft: 5,
              }}
              searchWords={[removeIllegalCharacters(query)]}
              textToHighlight={asset.name}
            />
          </ResourceNameWrapper>

          <Description>
            <Highlighter
              highlightStyle={{
                backgroundColor: Colors['yellow-4'].alpha(0.4),
                marginLeft: 5,
              }}
              searchWords={[removeIllegalCharacters(query)]}
              textToHighlight={asset.description ?? ' '}
            />
          </Description>
        </InfoContainer>
        <Right>
          <AssetCount>{dataAmount?.count} </AssetCount>
          <DelayedComponent delay={100}>
            <PnidButtonContainer>
              <PnidButton asset={asset}>P&amp;ID</PnidButton>
            </PnidButtonContainer>
          </DelayedComponent>
        </Right>
      </Row>
      <Row>
        {isExact && (
          <div>
            <ExactMatchLabel>Exact match on external id</ExactMatchLabel>
          </div>
        )}
      </Row>
      <Row>
        <TSList>
          {searchResultElements}
          {hasNextPage && (
            <TSItem>
              <Button type="link" onClick={() => fetchNextPage()}>
                Additional time series (
                {(dataAmount?.count || 0) - (timeseries?.length || 0)})
              </Button>
            </TSItem>
          )}
        </TSList>
      </Row>
    </AssetItem>
  );
}

const ExactMatchLabel = styled(Button)`
  &&& {
    background-color: ${Colors['green-2'].alpha(0.3)};
    font-size: 10px;
    height: 20px;
    padding: 10px;
    margin-left: 16px;
  }
`;

const AssetItem = styled.div<{ outline?: boolean }>`
  border: 1px solid var(--cogs-greyscale-grey4);
  ${(props) =>
    props.outline && `border: 2px dashed ${Colors['green-2'].alpha(0.6)};`}
  border-radius: 5px;
  margin-bottom: 10px;
  padding: 10px 15px 0px 15px;
`;

const AssetCount = styled.span`
  background-color: #fff;
  border: 1px solid var(--cogs-greyscale-grey4);
  border-radius: 5px;
  float: right;
  padding: 0 5px;
  margin-right: 8px;
  line-height: 26px;
`;

const TSList = styled.ul`
  width: 100%;
  padding: 0;
  margin: 10px 0 10px 0;
  list-style: none;
`;

const TSItem = styled.li`
  border-radius: 5px;
  padding: 0 5px;
  :nth-child(odd) {
    background-color: var(--cogs-greyscale-grey2);
  }
`;

const Row = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  word-break: break-word;
`;

const ResourceNameWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: top;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;

const Description = styled.span`
  margin-left: 20px;
  font-size: 10px;
  padding-top: 4px;
`;

const Right = styled.div`
  display: flex;
  flex-direction: row;
`;

const PnidButtonContainer = styled.div`
  background-color: #fff;
  border-radius: 6px;
  overflow: hidden;
`;
