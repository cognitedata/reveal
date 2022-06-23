import { Icon, Button, Colors } from '@cognite/cogs.js';
import Highlighter from 'react-highlight-words';
import { removeIllegalCharacters } from 'utils/text';
import { ComponentProps } from 'react';
import { Skeleton } from 'antd';
import { AssetItem } from './elements/AssetItem';
import { ExactMatchLabel } from './elements/ExactMatchLabel';
import { TSList } from './elements/TSList';
import { Row } from './elements/Row';
import { InfoContainer } from './elements/InfoContainer';
import { ResourceNameWrapper } from './elements/ResourceNameWrapper';
import { Description } from './elements/Description';
import { Right } from './elements/Right';
import { PnidButtonContainer } from './elements/PnidButtonContainer';
import TimeSeriesResultItem from './TimeSeriesResultItem';

type Props = {
  asset: {
    id: number;
    name: string;
    description?: string;
    totalTimeSeries: number;
    isExact?: boolean;
    hasDocuments: boolean;
  };
  loading: boolean;
  timeseries: {
    id: number;
    name: string;
    description: string;
    externalId: string;
    checked: boolean;
    isExact?: boolean;
    isStep: boolean;
    sparkline: ComponentProps<typeof TimeSeriesResultItem>['sparkline'];
  }[];
  loadingTimeseries: boolean;
  highlight?: string;
  onAssetClick: (assetId: number) => void;
  onTimeSeriesClick: (timeseriesInfo: {
    id: number;
    assetId: number;
    externalId: string;
    description: string;
    isStep: boolean;
  }) => void;
  onPAndIDClick: (assetId: number) => void;
  exactMatchLabel?: string;
  viewAllLabel?: string;
};

export default function LinkedAsset({
  asset,
  timeseries,
  highlight = '',
  onAssetClick,
  onTimeSeriesClick,
  onPAndIDClick,
  loading,
  loadingTimeseries,
  exactMatchLabel = 'Exact match on external id',
  viewAllLabel = 'View all',
}: Props) {
  return (
    <AssetItem outline={asset.isExact}>
      <Row>
        <InfoContainer>
          <ResourceNameWrapper>
            <Icon type="Assets" size={14} style={{ marginRight: 5 }} />
            {loading ? (
              <Skeleton.Button active block />
            ) : (
              <Highlighter
                highlightStyle={{
                  backgroundColor: Colors['yellow-4'].alpha(0.4),
                }}
                searchWords={removeIllegalCharacters(highlight).split(' ')}
                textToHighlight={asset.name}
                className="cogs-anchor"
                onClick={() => onAssetClick(asset.id)}
                style={{ cursor: 'pointer' }}
              />
            )}
          </ResourceNameWrapper>
          <Description>
            {highlight && asset.description ? (
              <Highlighter
                highlightStyle={{
                  backgroundColor: Colors['yellow-4'].alpha(0.4),
                }}
                searchWords={removeIllegalCharacters(highlight).split(' ')}
                textToHighlight={asset.description}
              />
            ) : (
              asset.description
            )}
          </Description>
        </InfoContainer>
        <Right>
          {asset.hasDocuments && (
            <PnidButtonContainer>
              <Button
                type={asset ? 'tertiary' : 'ghost'}
                icon="Document"
                onClick={() => onPAndIDClick(asset.id)}
                style={{ height: 28 }}
                iconPlacement="right"
                size="small"
                aria-label="search"
              >
                P&amp;ID
              </Button>
            </PnidButtonContainer>
          )}
        </Right>
      </Row>
      {asset.isExact && (
        <Row>
          <div>
            <ExactMatchLabel>{exactMatchLabel}</ExactMatchLabel>
          </div>
        </Row>
      )}
      <Row>
        <TSList>
          {timeseries.map(
            ({
              id,
              name,
              description,
              externalId,
              checked,
              sparkline,
              isExact,
              isStep,
            }) => (
              <TimeSeriesResultItem
                key={id}
                name={name}
                description={description}
                externalId={externalId}
                checked={checked}
                sparkline={sparkline}
                isExact={isExact}
                highlight={highlight}
                onCheckboxClick={() =>
                  onTimeSeriesClick({
                    id,
                    assetId: asset.id,
                    externalId,
                    description,
                    isStep,
                  })
                }
                exactMatchlabel={exactMatchLabel}
                loading={loadingTimeseries}
              />
            )
          )}
          {asset.totalTimeSeries > timeseries.length && (
            <Button
              type="link"
              onClick={() => onAssetClick(asset.id)}
              style={{ marginTop: 10 }}
            >
              {viewAllLabel} ({asset.totalTimeSeries})
            </Button>
          )}
        </TSList>
      </Row>
    </AssetItem>
  );
}
