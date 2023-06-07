import Highlighter from 'react-highlight-words';

import styled from 'styled-components';

import DelayedComponent from '@charts-app/components/DelayedComponent';
import { useAddRemoveTimeseries } from '@charts-app/components/Search/hooks';
import { SearchFilter } from '@charts-app/components/Search/Search';
import { useSearchParam } from '@charts-app/hooks/navigation';
import { useTranslations } from '@charts-app/hooks/translations';
import chartAtom from '@charts-app/models/chart/atom';
import { trackUsage } from '@charts-app/services/metrics';
import { ASSET_KEY } from '@charts-app/utils/constants';
import { removeIllegalCharacters } from '@charts-app/utils/text';
import { makeDefaultTranslations } from '@charts-app/utils/translations';
import { useRecoilState } from 'recoil';

import { Icon, Checkbox, Button, Colors } from '@cognite/cogs.js';
import { Asset, Timeseries } from '@cognite/sdk';
import { useAggregate, useList } from '@cognite/sdk-react-query-hooks';

import { PnidButton } from './PnidButton';
import TimeseriesSearchResultItem from './TimeseriesSearchResultItem';

const defaultTranslation = makeDefaultTranslations(
  'Exact match on external id',
  'View all'
);

const TIMESERIES_COUNT = 5;

type Props = {
  asset: Asset;
  query?: string;
  filter?: SearchFilter;
  isExact?: boolean;
};

export default function AssetSearchHit({
  asset,
  query = '',
  isExact,
  filter,
}: Props) {
  const [__, setUrlAssetId] = useSearchParam(ASSET_KEY);
  const [chart] = useRecoilState(chartAtom);
  const handleTimeSeriesClick = useAddRemoveTimeseries();

  const queryFilter = {
    assetSubtreeIds: [{ id: asset.id }],
    isStep: filter?.isStep,
    isString: Boolean(filter?.isString),
  };

  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'SearchResults').t,
  };

  const { data: timeseries = [] } = useList<Timeseries>('timeseries', {
    filter: queryFilter,
    limit: TIMESERIES_COUNT,
  });

  const { data: dataAmount, isFetched: isDataAmountFetched } = useAggregate(
    'timeseries',
    queryFilter
  );

  const selectedExternalIds: undefined | string[] = chart?.timeSeriesCollection
    ?.map((tsc) => tsc.tsExternalId || '')
    .filter(Boolean);

  const handleSelectAsset = (assetId: number) => {
    setUrlAssetId(String(assetId));
  };

  const searchResultElements = timeseries?.map((ts: Timeseries) => (
    <TimeseriesSearchResultItem
      key={ts.id}
      timeseries={ts}
      query={query}
      renderCheckbox={() => (
        <Checkbox
          onChange={(e) => {
            e.preventDefault();
            handleTimeSeriesClick(ts);
            trackUsage('ChartView.AddTimeSeries', { source: 'search' });
          }}
          name={`${ts.id}`}
          checked={selectedExternalIds?.includes(ts.externalId || '')}
        />
      )}
    />
  ));

  const shouldShowEmpty =
    isDataAmountFetched === false ||
    (!filter?.showEmpty && dataAmount?.count === 0);
  if (shouldShowEmpty) {
    return <></>;
  }

  return (
    <AssetItem outline={isExact}>
      <Row>
        <InfoContainer>
          <ResourceNameWrapper>
            <Icon type="Assets" size={14} style={{ marginRight: 5 }} />
            <Highlighter
              highlightStyle={{
                backgroundColor: Colors['yellow-4'].alpha(0.4),
                marginLeft: 5,
              }}
              searchWords={removeIllegalCharacters(query).split(' ')}
              textToHighlight={asset.name}
              className="cogs-anchor"
              onClick={() => handleSelectAsset(asset.id)}
              style={{ cursor: 'pointer' }}
            />
          </ResourceNameWrapper>

          <Description>
            <Highlighter
              highlightStyle={{
                backgroundColor: Colors['yellow-4'].alpha(0.4),
                marginLeft: 5,
              }}
              searchWords={removeIllegalCharacters(query).split(' ')}
              textToHighlight={asset.description ?? ' '}
            />
          </Description>
        </InfoContainer>
        <Right>
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
            <ExactMatchLabel>{t['Exact match on external id']}</ExactMatchLabel>
          </div>
        )}
      </Row>
      <Row>
        <TSList>
          {searchResultElements}
          {dataAmount && dataAmount.count > TIMESERIES_COUNT && (
            <TSItem>
              <Button type="ghost" onClick={() => handleSelectAsset(asset.id)}>
                {t['View all']} ({dataAmount.count})
              </Button>
            </TSItem>
          )}
        </TSList>
      </Row>
    </AssetItem>
  );
}

const ExactMatchLabel = styled(Button)`
  && {
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
    props.outline && `border: 2px dashed ${Colors['green-2'].alpha(0.6)};`};
  border-radius: 5px;
  margin-bottom: 10px;
  padding: 10px 15px 0px 15px;
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
  align-items: center;
  font-size: 12px;
  font-weight: 500;
  line-height: 16px;
`;

const Description = styled.span`
  margin-left: 20px;
  font-size: 10px;
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
