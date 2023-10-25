import { useContext } from 'react';

import styled from 'styled-components';

import { CanvasButton } from '@fusion/industry-canvas';

import { Divider, Flex } from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';

import { useTranslation } from '@data-exploration-lib/core';
import {
  Revision3DWithIndex,
  Image360SiteData,
} from '@data-exploration-lib/domain-layer';

import { useFlagPointsOfInterestFeature } from '../../../hooks';
import { ThreeDContext } from '../contexts/ThreeDContext';

import PointsOfInterestDropdown from './Dropdowns/PointsOfInterestDropdown';
import Secondary3DModelDropdown from './Dropdowns/Secondary3DModelDropdown';
import SecondaryImages360Dropdown from './Dropdowns/SecondaryImages360Dropdown';
import { ModelTypeButton } from './ModelTypeButton';

export type ThreeDTopbarProps = {
  model?: Model3D;
  mainRevision?: Revision3DWithIndex;
  mainImage360Data?: Image360SiteData;
};

export const ThreeDTopbar = ({
  model,
  mainRevision,
  mainImage360Data,
}: ThreeDTopbarProps): JSX.Element => {
  const {
    viewState,
    revisionId,
    secondaryModels,
    setSecondaryModels,
    images360,
    selectedAssetId,
    setImages360,
    setSecondaryObjectsVisibilityState,
    secondaryObjectsVisibilityState,
    pointsOfInterest,
    setPointsOfInterest,
  } = useContext(ThreeDContext);

  const { t } = useTranslation();

  const usePointsOfInterestFeatureFlag = useFlagPointsOfInterestFeature();

  if (!secondaryObjectsVisibilityState) return <></>;

  const lastUpdatedTime =
    mainRevision?.createdTime ?? mainImage360Data?.lastUpdatedTime;

  return (
    <>
      <Flex direction="row" gap={16}>
        <VerticallyCenteredText>
          {t(
            'LAST_UPDATE_WITH_TIME',
            `Last update: ${
              lastUpdatedTime?.toLocaleDateString('no-NO', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              }) ?? 'no data'
            }`,
            {
              time:
                lastUpdatedTime?.toLocaleDateString('no-NO', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                }) ?? t('NO_DATA', 'No data'),
            }
          )}
        </VerticallyCenteredText>
        <Divider direction="vertical" weight="2px" length="16px" />
        <Flex direction="row" gap={8}>
          <ModelTypeButton
            onVisibilityChange={(v) =>
              setSecondaryObjectsVisibilityState({
                ...secondaryObjectsVisibilityState,
                models3d: v,
              })
            }
            icon="Cube"
            dropdownContent={
              <Secondary3DModelDropdown
                mainModel={model}
                secondaryModels={secondaryModels}
                setSecondaryModels={setSecondaryModels}
              />
            }
          >
            {t('CAD_POINT_CLOUD_MODELS', 'CAD, Point cloud models')}
          </ModelTypeButton>
          <ModelTypeButton
            onVisibilityChange={(v) =>
              setSecondaryObjectsVisibilityState({
                ...secondaryObjectsVisibilityState,
                images360: v,
              })
            }
            icon="View360"
            dropdownContent={
              <SecondaryImages360Dropdown
                mainImage360SiteId={mainImage360Data?.siteId}
                images360={images360}
                setImages360={setImages360}
              />
            }
          >
            {t('360_IMAGE', '360 images', { count: 100 })}
          </ModelTypeButton>
          {usePointsOfInterestFeatureFlag && (
            <ModelTypeButton
              onVisibilityChange={(v) =>
                setSecondaryObjectsVisibilityState({
                  ...secondaryObjectsVisibilityState,
                  pointsOfInterest: v,
                })
              }
              icon="Waypoint"
              dropdownContent={
                <PointsOfInterestDropdown
                  internalPointsOfInterestCollections={pointsOfInterest}
                  setInternalPointsOfInterestCollections={setPointsOfInterest}
                />
              }
            >
              {t('POINTS_OF_INTEREST', 'Points of interest')}
            </ModelTypeButton>
          )}
          {model !== undefined && mainRevision !== undefined && (
            <CanvasButton
              item={{
                type: 'threeD',
                id: model.id,
                subId: revisionId,
                selectedAssetId: selectedAssetId,
                camera: viewState?.camera,
              }}
            />
          )}
        </Flex>
      </Flex>
    </>
  );
};

const VerticallyCenteredText = styled.div`
  display: flex;
  align-items: center;
`;
