import { useContext } from 'react';

import styled from 'styled-components';

import { Divider, Flex } from '@cognite/cogs.js';
import { Model3D } from '@cognite/sdk';

import { Revision3DWithIndex } from '@data-exploration-lib/domain-layer';

import { ThreeDContext } from '../contexts/ThreeDContext';
import { Image360SiteData } from '../hooks';

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
    secondaryModels,
    setSecondaryModels,
    images360,
    setImages360,
    setSecondaryObjectsVisibilityState,
    secondaryObjectsVisibilityState,
  } = useContext(ThreeDContext);

  if (!secondaryObjectsVisibilityState) return <></>;

  const lastUpdatedTime =
    mainRevision?.createdTime ?? mainImage360Data?.lastUpdatedTime;

  return (
    <>
      <Flex direction="row" gap={16}>
        <VerticallyCenteredText>
          {`Last update: ${
            lastUpdatedTime?.toLocaleDateString('no-NO', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
            }) ?? 'no data'
          }`}
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
            CAD, Point cloud models
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
            360 images
          </ModelTypeButton>
        </Flex>
      </Flex>
    </>
  );
};

const VerticallyCenteredText = styled.div`
  display: flex;
  align-items: center;
`;
