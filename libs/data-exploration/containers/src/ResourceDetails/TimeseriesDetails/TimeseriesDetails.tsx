import React, { FC, useMemo } from 'react';
import { Collapse, Title } from '@cognite/cogs.js';
import {
  useAssetsByIdQuery,
  useTimeseriesByIdsQuery,
} from '@data-exploration-lib/domain-layer';
import { ResourceDetailsTemplate } from '@data-exploration/components';
import styled from 'styled-components';
import { TimeseriesInfo } from '../../Info';
import { AssetDetailsTable } from '../../DetailsTable';
import { onOpenResources } from '../AssetDetails';
import { TimeseriesChart } from '@cognite/plotting-components';

interface Props {
  timeseriesId: number;
  isSelected: boolean;
  onSelectClicked?: () => void;
  onClose?: () => void;
}
export const TimeseriesDetails: FC<Props> = ({
  timeseriesId,
  isSelected,
  onSelectClicked,
  onClose,
}) => {
  const { data, isFetched: isTimeseriesFetched } = useTimeseriesByIdsQuery([
    { id: timeseriesId },
  ]);
  const timeseries = useMemo(() => {
    return data ? data[0] : undefined;
  }, [data]);

  const assetIds = timeseries?.assetId ? [timeseries.assetId] : [];
  const { data: relatedAssets = [], isLoading: isAssetsLoading } =
    useAssetsByIdQuery(
      assetIds.map((id) => ({ id })),
      { enabled: isTimeseriesFetched && assetIds.length > 0 }
    );

  return (
    <ResourceDetailsTemplate
      title={timeseries ? timeseries.name || '' : ''}
      icon="Timeseries"
      isSelected={isSelected}
      onClose={onClose}
      onSelectClicked={onSelectClicked}
    >
      <StyledCollapse accordion ghost defaultActiveKey="details">
        {timeseries ? (
          <Collapse.Panel key="preview" header={<h4>Preview</h4>}>
            <TimeseriesChart
              timeseriesId={timeseries.id}
              height={300}
              numberOfPoints={100}
              variant="medium"
              dataFetchOptions={{
                mode: 'aggregate',
              }}
              autoRange
            />
          </Collapse.Panel>
        ) : null}
        <Collapse.Panel key="details" header={<h4>Details</h4>}>
          {timeseries ? (
            <TimeseriesInfo timeseries={timeseries} />
          ) : (
            <Title level={5}>No Details Available</Title>
          )}
        </Collapse.Panel>
        <Collapse.Panel header={<h4>Assets</h4>}>
          <Wrapper>
            <AssetDetailsTable
              id="related-asset-timeseries-details"
              data={relatedAssets}
              isLoadingMore={isAssetsLoading}
              onRowClick={(currentAsset) =>
                onOpenResources('asset', currentAsset.id)
              }
            />
          </Wrapper>
        </Collapse.Panel>
      </StyledCollapse>
    </ResourceDetailsTemplate>
  );
};

const StyledCollapse = styled(Collapse)`
  overflow: auto;
`;

const Wrapper = styled.div`
  max-height: 240px;
  overflow: auto;
`;
