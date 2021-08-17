import React, { useState } from 'react';
import { Collapse, Input } from 'antd';
import styled from 'styled-components';
import { CaretRightOutlined } from '@ant-design/icons';
import { Body, Button, Detail, Tooltip } from '@cognite/cogs.js';
import { NO_EMPTY_LABELS_MESSAGE } from 'src/constants/CollectionSettings';
import { Header } from './Header';
import {
  AnnotationCollection,
  Keypoint,
  KeypointCollection,
} from '../CollectionSettingsTypes';
import { getRandomColor } from '../utill';
import { ColorPicker } from './ColorPicker';

const { Panel } = Collapse;

type NewKeypoints = {
  collectionName: string;
  keypoints: { [key: string]: Keypoint };
};

const handleClick = (evt: any) => {
  // dummy handler to stop event propagation
  evt.stopPropagation();
};

const validNewKeypoint = (newKeypoints: NewKeypoints | undefined) => {
  if (newKeypoints) {
    const { collectionName, keypoints } = newKeypoints;
    if (collectionName === '') return false;

    const keypointCaptions = Object.keys(keypoints).map(
      (key) => keypoints[key].caption
    );
    if (keypointCaptions.includes('')) return false;
  }
  return true;
};

export const Keypoints = ({
  collections,
  setCollections,
}: {
  collections: AnnotationCollection;
  setCollections: (collections: AnnotationCollection) => void;
}) => {
  const { predefinedKeypoints } = collections;
  const [newKeypoints, setNewKeypoints] =
    useState<NewKeypoints | undefined>(undefined);

  const addNewKeypoint = () => {
    if (newKeypoints) {
      const { keypoints } = newKeypoints;
      const nextIndex = Object.keys(keypoints).length + 1;
      const updatedKeypoints = {
        ...newKeypoints,
        keypoints: {
          ...keypoints,
          [`${nextIndex}`]: {
            caption: '',
            order: `${nextIndex}`,
            color: getRandomColor(),
          },
        },
      };
      setNewKeypoints(updatedKeypoints);
    }
  };
  const updateColor = (key: string, value: string) => {
    if (newKeypoints) {
      const { keypoints } = newKeypoints;
      setNewKeypoints({
        ...newKeypoints,
        keypoints: {
          ...keypoints,
          [key]: {
            ...newKeypoints.keypoints[key],
            color: value,
          },
        },
      });
    }
  };
  const updateOrder = (key: string, value: string) => {
    if (newKeypoints) {
      const { keypoints } = newKeypoints;
      setNewKeypoints({
        ...newKeypoints,
        keypoints: {
          ...keypoints,
          [key]: {
            ...newKeypoints.keypoints[key],
            order: value,
          },
        },
      });
    }
  };
  const updateCaption = (key: string, value: string) => {
    if (newKeypoints) {
      const { keypoints } = newKeypoints;
      setNewKeypoints({
        ...newKeypoints,
        keypoints: {
          ...keypoints,
          [key]: {
            ...newKeypoints.keypoints[key],
            caption: value,
          },
        },
      });
    }
  };
  const onDeleteKeypoint = (key: string) => {
    if (newKeypoints) {
      const { keypoints } = newKeypoints;
      delete keypoints[key];

      setNewKeypoints({
        ...newKeypoints,
        keypoints: {
          ...keypoints,
        },
      });
    }
  };
  const onFinish = () => {
    if (newKeypoints) {
      const { collectionName, keypoints } = newKeypoints;
      const finalKeypoints = Object.keys(keypoints).map(
        (key) => keypoints[key]
      );
      setCollections({
        ...collections,
        predefinedKeypoints: [
          ...collections.predefinedKeypoints,
          {
            collectionName,
            keypoints: finalKeypoints,
          },
        ],
      });
      setNewKeypoints(undefined);
    }
  };

  return (
    <>
      <Header
        title="Keypoints"
        count={predefinedKeypoints.length}
        onClickNew={() => {
          setNewKeypoints({
            collectionName: '',
            keypoints: {
              '0': { caption: '', order: '1', color: 'red' },
            },
          });
        }}
      />

      <CollapsePanel>
        <Collapse
          bordered={false}
          defaultActiveKey={['new']}
          expandIconPosition="left"
          expandIcon={({ isActive }) => (
            <CaretRightOutlined
              style={{ color: '#595959' }}
              rotate={isActive ? 270 : 90}
            />
          )}
        >
          {predefinedKeypoints &&
            predefinedKeypoints.map(
              (keypointCollection: KeypointCollection) => (
                <Panel
                  header={
                    <PanelHeader>
                      <Body level={2}>{keypointCollection.collectionName}</Body>
                    </PanelHeader>
                  }
                  key={keypointCollection.collectionName}
                >
                  <PanelBody>
                    <Row>
                      <OrderDetail style={{ marginLeft: '30px' }}>
                        Order
                      </OrderDetail>
                      <KeyPointDetail>Key point</KeyPointDetail>
                    </Row>
                    {keypointCollection.keypoints?.map((keypoint) => (
                      <Row key={`${keypoint.order}-${keypoint.caption}`}>
                        <ColorBox color={keypoint.color} />
                        <OrderDetail>{keypoint.order}</OrderDetail>
                        <KeyPointDetail>{keypoint.caption}</KeyPointDetail>
                      </Row>
                    ))}
                  </PanelBody>
                </Panel>
              )
            )}
          {/* New Keypoint Collection */}
          {newKeypoints && (
            <Panel
              header={
                <PanelHeader>
                  <PanelHeaderInput
                    onClick={handleClick}
                    value={newKeypoints.collectionName}
                    placeholder="Type label"
                    onChange={(e) => {
                      const { value } = e.target;
                      setNewKeypoints({
                        ...newKeypoints,
                        collectionName: value,
                      });
                    }}
                  />
                  <Button
                    icon="Trash"
                    onClick={() => setNewKeypoints(undefined)}
                    size="small"
                    type="ghost-danger"
                    aria-label="deleteButton"
                  />
                </PanelHeader>
              }
              key="new"
            >
              <PanelBody>
                <Row>
                  <Body style={{ marginLeft: '30px' }} level={3}>
                    Order
                  </Body>
                  <Body level={3}>Keypoint</Body>
                </Row>
                {Object.keys(newKeypoints.keypoints).map((key) => (
                  <Row>
                    <ColorPicker
                      size="16px"
                      color={newKeypoints.keypoints[key].color}
                      onChange={(newColor: string) => {
                        updateColor(key, newColor);
                      }}
                    />
                    <OrderInput
                      size="small"
                      value={newKeypoints.keypoints[key].order}
                      onChange={(e) => {
                        const { value } = e.target;
                        updateOrder(key, value);
                      }}
                    />
                    <KeypointInput
                      size="small"
                      value={newKeypoints.keypoints[key].caption}
                      placeholder="Type label"
                      onChange={(e) => {
                        const { value } = e.target;
                        updateCaption(key, value);
                      }}
                    />
                    <Button
                      icon="Trash"
                      onClick={() => onDeleteKeypoint(key)}
                      size="small"
                      type="ghost-danger"
                      aria-label="deleteButton"
                    />
                  </Row>
                ))}
                <KeypointControls>
                  <Button
                    type="secondary"
                    size="small"
                    icon="PlusCompact"
                    onClick={addNewKeypoint}
                  >
                    Add Key Point
                  </Button>
                  <Tooltip
                    content={
                      <span data-testid="text-content">
                        {NO_EMPTY_LABELS_MESSAGE}
                      </span>
                    }
                    disabled={validNewKeypoint(newKeypoints)}
                  >
                    <Button
                      type="primary"
                      size="small"
                      icon="Checkmark"
                      onClick={onFinish}
                      disabled={!validNewKeypoint(newKeypoints)}
                    >
                      Finish
                    </Button>
                  </Tooltip>
                </KeypointControls>
              </PanelBody>
            </Panel>
          )}
        </Collapse>
      </CollapsePanel>
    </>
  );
};

const CollapsePanel = styled.div`
  overflow: auto;
  max-height: 500px;
  .ant-collapse-header {
    padding: 12px 12px 12px 33px;
  }
  .ant-collapse-content-box {
    padding: 0;
    background: #ffffff;
  }
`;

const PanelHeader = styled.div`
  display: grid;
  grid-auto-flow: column;
  align-items: center;
  justify-content: space-between;
`;

const PanelBody = styled.div``;

const Row = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 15px;
  justify-content: start;
  align-items: center;
  padding: 10px;
  border-bottom: 0.5px solid #d9d9d9;
`;

const ColorBox = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  background: ${(props) => props.color};
`;
const OrderDetail = styled(Detail)`
  width: 36px;
  background: #ffffff;
  font-size: 12px;
`;
const KeyPointDetail = styled(Detail)`
  width: 180px;
  background: #ffffff;
  font-size: 12px;
`;

const PanelHeaderInput = styled(Input)`
  width: 200px;
  background: #ffffff;
`;
const OrderInput = styled(Input)`
  width: 24px;
  height: 24px;
  background: #ffffff;
  font-size: 12px;
`;
const KeypointInput = styled(Input)`
  width: 180px;
  height: 24px;
  background: #ffffff;
  font-size: 12px;
`;
const KeypointControls = styled.div`
  display: grid;
  grid-auto-flow: column;
  gap: 5px;
  justify-content: end;
  padding: 10px;
`;
