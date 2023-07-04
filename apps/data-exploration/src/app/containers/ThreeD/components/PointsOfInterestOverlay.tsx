import { useEffect, useState } from 'react';

import styled from 'styled-components';

import sdk from '@cognite/cdf-sdk-singleton';
import { createLink } from '@cognite/cdf-utilities';
import {
  Button,
  Tooltip,
  Colors,
  Elevations,
  Icon,
  Title,
  Chip,
  Row,
  Body,
  Flex,
  Modal,
} from '@cognite/cogs.js';

import { useFileDownloadLinks } from '../hooks/useFileDownloadLinks';

export type PointsOfInterestOverlayProps = {
  pointOfInterestData: PointOfInterestOverlayData;
  onClose: () => void;
};

export type PointOfInterestOverlayData = {
  title: string;
  description: string;
  imageExternalIds: string[];
};

export const PointsOfInterestOverlay: React.FC<
  PointsOfInterestOverlayProps
> = ({ pointOfInterestData, onClose }) => {
  const [imagePreviewState, setImagePreviewState] = useState({
    visible: false,
    fileId: -1,
    src: '',
  });

  const {
    data: fileLinks,
    refetch: refetchLinks,
    isError: linkError,
    isFetched: linksFetched,
  } = useFileDownloadLinks(pointOfInterestData.imageExternalIds);

  useEffect(() => {
    refetchLinks();
  }, [refetchLinks, pointOfInterestData]);

  const onImageClick = async (externalId: string) => {
    const links = await sdk.files.getDownloadUrls([{ externalId }]);
    const fileId = (await sdk.files.retrieve([{ externalId }]))[0]?.id;

    setImagePreviewState({
      visible: true,
      fileId,
      src: links[0].downloadUrl,
    });
  };

  return (
    <>
      <StyledModal
        title={pointOfInterestData.title + ' media preview'}
        additionalActions={{
          children: 'File details',
          icon: 'ExternalLink',
          iconPlacement: 'right',
          onClick: () => {
            window.open(
              createLink(`/explore/search/file/${imagePreviewState.fileId}`),
              '_blank',
              'noreferrer'
            );
          },
        }}
        size="x-large"
        onCancel={() =>
          setImagePreviewState({ ...imagePreviewState, visible: false })
        }
        onOk={() =>
          setImagePreviewState({ ...imagePreviewState, visible: false })
        }
        visible={imagePreviewState.visible}
      >
        <div
          style={{ height: '100%', display: 'flex', justifyContent: 'center' }}
        >
          <StyledImage src={imagePreviewState.src} alt="thumbnail" />
        </div>
      </StyledModal>
      <Container>
        <Header>
          <InnerHeaderWrapper>
            <StyledIcon
              type="Wrench"
              color={Colors['text-icon--status-neutral']}
            />
            <Label>{pointOfInterestData.title}</Label>
          </InnerHeaderWrapper>

          <ButtonsContainer>
            <ButtonWrapper>
              <Tooltip content="Close">
                <Button size="small" icon="Close" onClick={onClose} />
              </Tooltip>
            </ButtonWrapper>
          </ButtonsContainer>
        </Header>
        <Flex direction="column" gap={3}>
          <StyledDescription level={3}>
            {pointOfInterestData.description}
          </StyledDescription>

          <MediaHeader level={3}>
            Media{'  '}
            <Chip
              type="default"
              size="x-small"
              label={(fileLinks?.length ?? 0).toString()}
            />
          </MediaHeader>

          {linkError ? (
            <StyledDescription level={3}>
              Error retrieving media
            </StyledDescription>
          ) : pointOfInterestData.imageExternalIds.length === 0 ? (
            <StyledDescription level={3}>No media available</StyledDescription>
          ) : linksFetched ? (
            <Row auto={85}>
              {fileLinks?.map((link) => {
                return (
                  <StyledImage
                    src={link.downloadUrl}
                    key={link.downloadUrl}
                    draggable={false}
                    alt="thumbnail"
                    onClick={() => onImageClick(link.externalId)}
                  />
                );
              })}
            </Row>
          ) : (
            <Icon type="Loader" />
          )}
        </Flex>
      </Container>
    </>
  );
};

const StyledModal = styled(Modal)`
  width: fit-content;
`;

const MediaHeader = styled(Body)`
  padding: 4px 0;
  color: ${Colors['text-icon--strong']};
`;

const StyledImage = styled.img`
  border-radius: 6px;
  border: 2px solid #53587f3d;
  width: 100%;
  cursor: pointer;
`;

const Container = styled.div`
  width: 296px;
  background: ${Colors['surface--muted']};
  border: 1px solid ${Colors['border--muted']};
  box-shadow: ${Elevations['elevation--overlay']};
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  max-height: 400px;
  overflow-y: auto;
  user-select: none;
`;

const Header = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding-bottom: 4px;
  justify-content: space-between;
`;

const InnerHeaderWrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const StyledIcon = styled(Icon)<{ color: string }>`
  color: ${(props) => props.color};
  margin-right: 6px;
  flex-shrink: 0;
`;

const Label = styled(Title).attrs({
  level: 5,
})`
  color: ${Colors['text-icon--strong']};
  justify-content: center;
  align-items: center;
  word-break: break-all;
  overflow-wrap: break-word;
`;

const StyledDescription = styled(Body).attrs({
  level: 3,
})`
  color: ${Colors['text-icon--muted']};
`;

const ButtonsContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
`;

const ButtonWrapper = styled.div`
  &:not(:last-child) {
    margin-right: 4px;
  }
`;
