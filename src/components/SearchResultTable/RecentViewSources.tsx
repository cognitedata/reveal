import { useEffect } from 'react';
import { Checkbox, Icon, Title } from '@cognite/cogs.js';
import styled from 'styled-components/macro';
import { Asset, Timeseries } from '@cognite/sdk';
import { useRecentViewLocalStorage } from 'hooks/recently-used';
import { useCdfItems } from 'hooks/cognite-functions';
import { useQueryClient } from 'react-query';
import { useRecoilState } from 'recoil';
import { useAddRemoveTimeseries } from 'components/Search/hooks';
import chartAtom from 'models/chart/atom';
import { trackUsage } from 'services/metrics';
import { makeDefaultTranslations } from 'utils/translations';
import { useTranslations } from 'hooks/translations';
import AssetSearchHit from './AssetSearchHit';
import TimeseriesSearchResultItem from './TimeseriesSearchResultItem';

const defaultTranslation = makeDefaultTranslations('Recently viewed');

type Props = {
  viewType: 'assets' | 'timeseries';
};

const RecentViewSources = ({ viewType }: Props) => {
  const title = viewType === 'assets' ? 'tags / assets' : 'time series';
  const [chart] = useRecoilState(chartAtom);
  // Takes alot of time to load data
  const { data: rvResults } = useRecentViewLocalStorage(viewType, []);
  const handleTimeSeriesClick = useAddRemoveTimeseries();
  const t = {
    ...defaultTranslation,
    ...useTranslations(Object.keys(defaultTranslation), 'SearchResults').t,
  };

  const cached = useQueryClient();
  const selectedExternalIds: undefined | string[] = chart?.timeSeriesCollection
    ?.map((tsc) => tsc.tsExternalId || '')
    .filter(Boolean);

  useEffect(() => {
    cached.invalidateQueries([`rv-${viewType}`]);
  }, [viewType, cached]);

  const { data: sources } = useCdfItems<Asset | Timeseries>(
    viewType,
    (rvResults || []).map((id) => ({ id })) || [],
    false,
    { enabled: !!rvResults && rvResults.length > 0 }
  );

  if (!rvResults || rvResults.length === 0) {
    return null;
  }

  return (
    <Container>
      <TitleWrapper>
        <Icon type="History" size={20} />
        <Title level={4}>
          {t['Recently viewed']} {title}
        </Title>
      </TitleWrapper>

      <div>
        {viewType === 'assets'
          ? (sources || []).map((source) => (
              <li key={source.id}>
                <AssetSearchHit asset={source as Asset} />
              </li>
            ))
          : (sources as Timeseries[])?.map((ts) => (
              <TimeseriesSearchResultItem
                key={ts.id}
                timeseries={ts}
                renderCheckbox={() => (
                  <Checkbox
                    onClick={(e) => {
                      e.preventDefault();
                      handleTimeSeriesClick(ts);
                      trackUsage('ChartView.AddTimeSeries', {
                        source: 'search',
                      });
                    }}
                    name={`${ts.id}`}
                    checked={selectedExternalIds?.includes(ts.externalId || '')}
                  />
                )}
              />
            ))}
      </div>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const TitleWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1em;
  margin: 10px 28px 20px 10px;
`;

export default RecentViewSources;
