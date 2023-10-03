import { ComponentProps } from 'react';
import Highlighter from 'react-highlight-words';

import { Icon, Button, Colors } from '@cognite/cogs.js';

import { removeIllegalCharacters } from '../../utils/text';

import { AssetItem } from './elements/AssetItem';
import { Description } from './elements/Description';
import { ExactMatchLabel } from './elements/ExactMatchLabel';
import { InfoContainer } from './elements/InfoContainer';
import { PnidButtonContainer } from './elements/PnidButtonContainer';
import { ResourceNameWrapper } from './elements/ResourceNameWrapper';
import { Right } from './elements/Right';
import { Row } from './elements/Row';
import { TSList } from './elements/TSList';
import LoadingLinkedAsset from './LoadingLinkedAsset';
import TimeSeriesResultItem from './TimeSeriesResultItem';

type Props = {
  asset:
    | {
        id: number;
        name: string;
        description?: string;
        totalTimeSeries: number;
        isExact?: boolean;
        hasDocuments: boolean;
      }
    | undefined;
  loading: boolean;
  timeseries: {
    id: number;
    name: string;
    description: string;
    externalId: string;
    checked: boolean;
    disabled?: boolean;
    checkboxTooltip?: string;
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
  if (loading) return <LoadingLinkedAsset />;
  if (!asset) throw new Error('Asset must be present!');

  return (
    <AssetItem outline={asset.isExact}>
      <Row>
        <InfoContainer>
          <ResourceNameWrapper>
            <Icon type="Assets" size={14} css={{ marginRight: 5 }} />
            <Highlighter
              highlightStyle={{
                backgroundColor: Colors['decorative--yellow--400'],
              }}
              searchWords={removeIllegalCharacters(highlight).split(' ')}
              textToHighlight={asset.name}
              className="cogs-anchor"
              onClick={() => onAssetClick(asset.id)}
              style={{ cursor: 'pointer' }}
            />
          </ResourceNameWrapper>
          <Description>
            {highlight && asset.description ? (
              <Highlighter
                highlightStyle={{
                  backgroundColor: Colors['decorative--yellow--400'],
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
              disabled,
              checkboxTooltip,
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
                disabled={disabled}
                checkboxTooltip={checkboxTooltip}
                sparkline={sparkline}
                isExact={isExact}
                highlight={highlight}
                onCheckboxClick={() =>
                  !disabled &&
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
              type="ghost"
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
