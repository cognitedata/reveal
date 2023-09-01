import React from 'react';

import styled from 'styled-components';

import {
  Icon,
  Colors,
  Body,
  Button,
  Dropdown,
  Menu,
  Tooltip,
} from '@cognite/cogs.js';

import { translationKeys } from '../../../common';
import { useAsset } from '../../../hooks/useAsset';
import { useTranslation } from '../../../hooks/useTranslation';
import * as ContextualTooltip from '../ContextualTooltip';

import ThreeDButton from './ThreeDButton';
import TimeseriesList from './TimeseriesList';

export type AssetTooltipProps = {
  id: number;
  onAddThreeD: ({
    modelId,
    revisionId,
    initialAssetId,
  }: {
    modelId: number;
    revisionId: number;
    initialAssetId?: number;
  }) => void;
  onAddTimeseries: (timeseriesId: number) => void;
  onAddAsset: () => void;
  onViewAsset: () => void;
  pinnedTimeseriesIds: number[];
  onPinTimeseriesClick: (timeseriesId: number) => void;
  onOpenAssetInResourceSelector: () => void;
  onOpenTimeseriesTabInResourceSelector: () => void;
  onSetConditionalFormattingClick: (() => void) | undefined;
};

const AssetTooltip: React.FC<AssetTooltipProps> = ({
  id,
  onAddAsset,
  onViewAsset,
  onAddThreeD,
  onAddTimeseries,
  pinnedTimeseriesIds,
  onPinTimeseriesClick,
  onOpenAssetInResourceSelector,
  onOpenTimeseriesTabInResourceSelector,
  onSetConditionalFormattingClick,
}) => {
  const { data: asset, isLoading } = useAsset(id);
  const { t } = useTranslation();

  if (isLoading) {
    return <Icon type="Loader" />;
  }

  if (asset === undefined) {
    // This should probably never happen
    return null;
  }

  return (
    <ContextualTooltip.Container>
      <ContextualTooltip.Header>
        <ContextualTooltip.InnerHeaderWrapper>
          <ContextualTooltip.StyledIcon
            type="Assets"
            color={Colors['text-icon--status-neutral--inverted']}
          />
          <ContextualTooltip.Label>
            {asset.name ?? asset.externalId}
          </ContextualTooltip.Label>
        </ContextualTooltip.InnerHeaderWrapper>

        <ContextualTooltip.ButtonsContainer>
          <ContextualTooltip.ButtonWrapper>
            <Tooltip
              content={t(
                translationKeys.TOOLTIP_ASSET_ADD_TO_CANVAS,
                'Add asset to canvas'
              )}
            >
              <Button icon="Add" onClick={onAddAsset} inverted />
            </Tooltip>
          </ContextualTooltip.ButtonWrapper>
          <ContextualTooltip.ButtonWrapper>
            <ThreeDButton
              assetId={asset.id}
              onAddThreeD={onAddThreeD}
              aria-label={t(
                translationKeys.TOOLTIP_THREE_D_MODEL_ADD_TO_CANVAS,
                'Add 3D model to canvas'
              )}
            />
          </ContextualTooltip.ButtonWrapper>
          <Dropdown
            openOnHover
            placement="right"
            content={
              <ContextualTooltip.DropdownMenu>
                <Menu.Item
                  iconPlacement="left"
                  icon="ExternalLink"
                  onClick={onViewAsset}
                  aria-label={t(
                    translationKeys.OPEN_IN_DATA_EXPLORER,
                    'Open in Data Explorer'
                  )}
                >
                  {t(
                    translationKeys.OPEN_IN_DATA_EXPLORER,
                    'Open in Data Explorer'
                  )}
                </Menu.Item>
                <Menu.Item
                  iconPlacement="left"
                  icon="ListSearch"
                  onClick={onOpenAssetInResourceSelector}
                  aria-label={t(
                    translationKeys.FIND_RELATED_DATA,
                    'Find related data'
                  )}
                >
                  {t(translationKeys.FIND_RELATED_DATA, 'Find related data')}
                </Menu.Item>
                <Tooltip
                  content={
                    onSetConditionalFormattingClick === undefined
                      ? t(
                          translationKeys.SET_CONDITIONAL_FORMATTING_DISABLED,
                          'No pinned time series. Pin a time series to enable conditional formatting.'
                        )
                      : undefined
                  }
                  disabled={onSetConditionalFormattingClick !== undefined}
                >
                  <Menu.Item
                    iconPlacement="left"
                    icon="Lightning"
                    onClick={onSetConditionalFormattingClick}
                    aria-label={t(
                      translationKeys.SET_CONDITIONAL_FORMATTING,
                      'Set conditional formatting'
                    )}
                    disabled={onSetConditionalFormattingClick === undefined}
                  >
                    {t(
                      translationKeys.SET_CONDITIONAL_FORMATTING,
                      'Set conditional formatting'
                    )}
                  </Menu.Item>
                </Tooltip>
              </ContextualTooltip.DropdownMenu>
            }
          >
            <Button
              icon="EllipsisHorizontal"
              inverted
              aria-label={t(
                translationKeys.TOOLTIP_ASSET_SHOW_MORE_ACTIONS,
                'Show additional asset actions'
              )}
            />
          </Dropdown>
        </ContextualTooltip.ButtonsContainer>
      </ContextualTooltip.Header>

      <AssetType inverted size="x-small">
        Asset
      </AssetType>

      {asset.description !== undefined && (
        <ContextualTooltip.Description level={3}>
          {asset.description}
        </ContextualTooltip.Description>
      )}
      <TimeseriesList
        assetId={id}
        pinnedTimeseriesIds={pinnedTimeseriesIds}
        onPinTimeseriesClick={onPinTimeseriesClick}
        onAddTimeseries={onAddTimeseries}
        onFindRelatedTimeseries={onOpenTimeseriesTabInResourceSelector}
      />
    </ContextualTooltip.Container>
  );
};

const AssetType = styled(Body)`
  padding: 4px 0;
  text-transform: uppercase;
`;

export default AssetTooltip;
