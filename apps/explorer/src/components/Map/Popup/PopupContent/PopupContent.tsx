import { Button, Flex } from '@cognite/cogs.js';
import { MapContext } from 'components/Map/MapProvider';
import { Scalars } from 'graphql/generated';
import { PAGES } from 'pages/constants';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';

import {
  FullWidthContainer,
  ButtonWithMargin,
  DivWithMarginBottom,
  FlexColumnSpaceAround,
  FlexSpaceBetween,
} from '../elements';

import { NavigationButton } from './NavigationButton';

interface Props {
  isEditable?: boolean;
  nodeId?: any;
  Icon: () => JSX.Element | null;
}

export const PopupContent: React.FC<React.PropsWithChildren<Props>> = ({
  Icon,
  nodeId,
  isEditable = true,
  children,
}) => {
  const { modelRef, viewerRef } = useContext(MapContext);
  const setIsEditMode = useSetRecoilState(isEditModeAtom);

  const zoomToNodeId = async (nodeId: Scalars['Int64']) => {
    if (nodeId) {
      try {
        const boundingBox = await modelRef.current.getBoundingBoxByNodeId(
          nodeId
        );
        if (boundingBox) {
          viewerRef.current.cameraManager.fitCameraToBoundingBox(boundingBox);
        }
      } catch (e) {
        // console.log(e);
      }
    }
  };

  const handleEditButtonClick = () => setIsEditMode(true);
  const handleLocationButtonClick = () => zoomToNodeId(nodeId);

  return (
    <FlexColumnSpaceAround>
      <DivWithMarginBottom>
        <FlexSpaceBetween>
          <Icon />
          <div>
            {isEditable && (
              <Button
                icon="Edit"
                onClick={handleEditButtonClick}
                aria-label="Edit information"
              />
            )}
            <Link to={PAGES.HOME}>
              <ButtonWithMargin
                type="ghost"
                icon="Close"
                aria-label="Close popup"
              />
            </Link>
          </div>
        </FlexSpaceBetween>
        <FullWidthContainer>{children}</FullWidthContainer>
      </DivWithMarginBottom>
      <Flex justifyContent="flex-end">
        <Button disabled={!nodeId} onClick={handleLocationButtonClick}>
          Show Location
        </Button>
        <NavigationButton nodeId={nodeId} />
      </Flex>
    </FlexColumnSpaceAround>
  );
};
