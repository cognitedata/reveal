import { Button, Title } from '@cognite/cogs.js';
import { MapContext } from 'components/Map/MapProvider';
import { Scalars } from 'graphql/generated';
import { PAGES } from 'pages/constants';
import { useContext } from 'react';
import { Link } from 'react-router-dom';
import { useSetRecoilState } from 'recoil';
import { isEditModeAtom } from 'recoil/popupShared/isEditModeAtom';

import {
  FullWidthContainer,
  DivWithMarginBottom,
  FlexColumnSpaceBetween,
  FlexSpaceBetween,
  DivLine,
  DisplayContainer,
  Content,
} from '../elements';

import { NavigationButton } from './NavigationButton';

interface Props {
  isEditable?: boolean;
  nodeId?: any;
  name: string;
}

export const PopupContent: React.FC<React.PropsWithChildren<Props>> = ({
  nodeId,
  name,
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
    <DisplayContainer>
      <Content>
        <FlexColumnSpaceBetween>
          <Link to={PAGES.HOME}>
            <DivLine />
          </Link>
          <DivWithMarginBottom>
            <FlexSpaceBetween>
              <Title level={3}>{name}</Title>
              <div>
                {isEditable && (
                  <Button
                    icon="Edit"
                    type="ghost"
                    onClick={handleEditButtonClick}
                    aria-label="Edit information"
                  />
                )}
              </div>
            </FlexSpaceBetween>
            <FullWidthContainer>{children}</FullWidthContainer>
          </DivWithMarginBottom>

          <NavigationButton nodeId={nodeId} />
          <Button disabled={!nodeId} onClick={handleLocationButtonClick}>
            Show Location
          </Button>
        </FlexColumnSpaceBetween>
      </Content>
    </DisplayContainer>
  );
};
