import { CogniteAnnotation } from '@cognite/annotations';
import { ProposedCogniteAnnotation } from '@cognite/react-picture-annotation';
import { Body, Checkbox, Icon, Menu, Overline, Title } from '@cognite/cogs.js';
import { useAssetTimeseries } from 'hooks/cdf-assets';
import { useAsset } from 'models/cdf/assets/queries/useAsset';
import styled from 'styled-components/macro';
import { TimeseriesChart } from '@cognite/data-exploration';
import dayjs from 'dayjs';
import { trackUsage } from 'services/metrics';
import { useRecoilState } from 'recoil';
import chartAtom from 'models/charts/charts/atoms/atom';
import { useAddRemoveTimeseries } from 'components/Search/hooks';

export const AnnotationPopover = ({
  annotations,
  annotationTitle = 'Time series',
  fallbackText = 'Asset not found!',
}: {
  annotations: (CogniteAnnotation | ProposedCogniteAnnotation)[];
  annotationTitle: string;
  fallbackText: string;
}) => {
  const annotation = annotations[0];
  const selectedAssetId =
    annotation?.resourceType === 'asset' ? annotation.resourceId : undefined;

  const { data: asset, isLoading } = useAsset(selectedAssetId);

  if (annotation?.resourceType !== 'asset' || !selectedAssetId) {
    return <></>;
  }

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
          <Title level={5}>{asset.name}</Title>
          <Body level={2}>{asset.description}</Body>
        </AssetInfoContainer>
      </TitleContainer>
      <TimeseriesTitle>
        <Overline level={2} style={{ color: 'var(--cogs-greyscale-grey6)' }}>
          {`${annotationTitle}:`}
        </Overline>
      </TimeseriesTitle>
      <TimeseriesList assetId={selectedAssetId} />
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
    return <Icon type="Loader" style={{ margin: 10 }} />;
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
            onClick={(e) => {
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
