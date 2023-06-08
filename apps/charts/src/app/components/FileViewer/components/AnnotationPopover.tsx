import { useAddRemoveTimeseries } from '@charts-app/components/Search/hooks';
import {
  useAsset,
  useAssetTimeseries,
  useAssetList,
} from '@charts-app/hooks/cdf-assets';
import chartAtom from '@charts-app/models/chart/atom';
import { trackUsage } from '@charts-app/services/metrics';
import dayjs from 'dayjs';
import { useRecoilState } from 'recoil';
import styled from 'styled-components/macro';

import { Body, Checkbox, Icon, Menu, Overline, Title } from '@cognite/cogs.js';
import { TimeseriesChart } from '@cognite/data-exploration';

export const AnnotationPopover = ({
  resourceId,
  label,
  annotationTitle = 'Time series',
  fallbackText = 'Asset not found!',
}: {
  resourceId?: number;
  label?: string;
  annotationTitle?: string;
  fallbackText?: string;
}) => {
  if (!resourceId && !label) {
    return <></>;
  }

  const { data: selectedAsset, isLoading: isLoadingAsset } =
    useAsset(resourceId);

  const { data: assets, isLoading: isLoadingListAsset } = useAssetList(label);

  const asset = selectedAsset || assets?.items[0];
  const isLoading = isLoadingAsset || isLoadingListAsset;

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  if (!asset) {
    return <>{fallbackText}</>;
  }

  return (
    <StyledMenu>
      <TitleContainer>
        <IconBackground>
          <Icon type="Assets" />
        </IconBackground>
        <AssetInfoContainer>
          <Title level={5}>{asset.name || label}</Title>
          <Body level={2}>{asset.description}</Body>
        </AssetInfoContainer>
      </TitleContainer>
      <TimeseriesTitle>
        <Overline level={2} style={{ color: 'var(--cogs-greyscale-grey6)' }}>
          {`${annotationTitle}:`}
        </Overline>
      </TimeseriesTitle>
      <TimeseriesList assetId={asset.id} />
    </StyledMenu>
  );
};

const TimeseriesList = ({ assetId }: { assetId: number }) => {
  const [chart] = useRecoilState(chartAtom);
  const handleTimeSeriesClick = useAddRemoveTimeseries();

  const { data: timeseries = [], isLoading } = useAssetTimeseries(assetId);

  const sparklineStartDate = dayjs()
    .subtract(1, 'years')
    .startOf('day')
    .toDate();

  const sparklineEndDate = dayjs().endOf('day').toDate();

  if (isLoading) {
    return <Icon type="Loader" css={{ margin: 10 }} />;
  }

  if (timeseries.length === 0) {
    return <span style={{ margin: 10 }}>No timeseries found</span>;
  }

  return (
    <div>
      {timeseries.map((ts) => (
        <TimeseriesItem key={ts.id}>
          <TimeseriesInfo>
            <Title level={6} style={{ width: 290, wordBreak: 'break-all' }}>
              {ts.name}
            </Title>
            <Body level={2}>{ts.description}</Body>
            <TimeseriesChart
              height={55}
              showSmallerTicks
              timeseriesId={ts.id}
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
          </TimeseriesInfo>
          <Checkbox
            onChange={(e) => {
              e.preventDefault();
              handleTimeSeriesClick(ts);
              trackUsage('ChartView.AddTimeSeries', { source: 'annotation' });
            }}
            name={`${ts.id}`}
            value={
              !!chart?.timeSeriesCollection?.find(
                (t) => t.tsExternalId === ts.externalId
              )
            }
          />
        </TimeseriesItem>
      ))}
    </div>
  );
};

const StyledMenu = styled(Menu)`
  width: 350px;
  max-height: 400px;
  padding: 0;
  overflow-y: auto;
`;

const TitleContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: top;
  padding: 15px;
`;

const AssetInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const TimeseriesTitle = styled(Menu.Header)`
  border-top: 1px solid var(--cogs-greyscale-grey4);
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
`;

const IconBackground = styled.div`
  padding: 6px;
  background-color: var(--cogs-greyscale-grey2);
  color: var(--cogs-greyscale-grey7);
  border-radius: 4px;
  height: 26px;
  margin-right: 10px;
`;

const TimeseriesItem = styled.div`
  padding: 15px;
  border-bottom: 1px solid var(--cogs-greyscale-grey4);
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const TimeseriesInfo = styled.div`
  flex-grow: 2;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;
