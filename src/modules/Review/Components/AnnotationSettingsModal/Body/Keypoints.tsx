import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Collapse, Input } from 'antd';
import { ColorsPersonDetection } from 'src/constants/Colors';
import { ColorPicker } from 'src/modules/Common/Components/ColorPicker/ColorPicker';
import {
  getRandomColor,
  validNewKeypoint,
} from 'src/modules/Review/Components/AnnotationSettingsModal/AnnotationSettingsUtils';
import {
  PredefinedKeypoint,
  PredefinedKeypointCollection,
} from 'src/modules/Review/types';
import { isSensitiveAnnotationLabel } from 'src/utils/textUtils';
import styled from 'styled-components';
import { CaretRightOutlined } from '@ant-design/icons';
import { Body, Button, Detail, Tooltip } from '@cognite/cogs.js';
import { NO_EMPTY_LABELS_MESSAGE } from 'src/constants/annotationSettingsConstants';
import isEmpty from 'lodash-es/isEmpty';
import { NewKeypoints } from 'src/modules/Review/Components/AnnotationSettingsModal/types';
import { ToastUtils } from 'src/utils/ToastUtils';
import { Header } from './Header';
import { renderEmptyAnnotationMessage } from './EmptyAnnotationInfo';

const { Panel } = Collapse;

const handleClick = (evt: any) => {
  // dummy handler to stop event propagation
  evt.stopPropagation();
};

export const Keypoints = ({
  predefinedKeypointCollections,
  unsavedKeypointCollections,
  setUnsavedKeypointCollections,
  creationInProgress,
  options,
}: {
  predefinedKeypointCollections: PredefinedKeypointCollection[];
  unsavedKeypointCollections: PredefinedKeypointCollection[];
  setUnsavedKeypointCollections: (
    keypointCollections: PredefinedKeypointCollection[]
  ) => void;
  creationInProgress: (inProgress: boolean) => void;
  options?: { createNew?: { text?: string } };
}) => {
  const [newKeypoints, setNewKeypoints] =
    useState<NewKeypoints | undefined>(undefined);
  const keypointPanelRef = useRef<HTMLDivElement | null>(null);

  const allKeypointCollections: (PredefinedKeypointCollection & {
    unsaved?: boolean;
  })[] = useMemo(() => {
    return [
      ...predefinedKeypointCollections,
      ...unsavedKeypointCollections.map((sp) => ({ ...sp, unsaved: true })),
    ].sort((a, b) =>
      a.collectionName.toLowerCase() > b.collectionName.toLowerCase() ? 1 : -1
    );
  }, [predefinedKeypointCollections, unsavedKeypointCollections]);

  const addNewKeypoint = () => {
    if (newKeypoints) {
      const { color, keypoints } = newKeypoints;
      keypoints.push({
        caption: '',
        color,
      });
      setNewKeypoints({
        ...newKeypoints,
        keypoints: [...keypoints],
      });
    }
  };

  const addNewKeypointGroup = (newKeypointGroup?: { text?: string }) => {
    const color = getRandomColor();
    setNewKeypoints({
      collectionName: newKeypointGroup?.text || '',
      color,
      keypoints: [{ caption: '', color }],
    });
  };

  const updateColor = (value: string) => {
    if (newKeypoints) {
      const { keypoints } = newKeypoints;
      setNewKeypoints({
        ...newKeypoints,
        color: value,
        keypoints: [...keypoints.map((item) => ({ ...item, color: value }))],
      });
    }
  };
  const updateCaption = (index: number, value: string) => {
    if (newKeypoints) {
      const { keypoints } = newKeypoints;
      keypoints[index].caption = value;
      setNewKeypoints({
        ...newKeypoints,
        keypoints: [...keypoints],
      });
    }
  };
  const onDeleteKeypoint = (index: number) => {
    if (newKeypoints) {
      const { keypoints } = newKeypoints;
      keypoints.splice(index, 1);

      setNewKeypoints({
        ...newKeypoints,
        keypoints: [...keypoints],
      });
    }
  };
  const onFinish = () => {
    if (newKeypoints) {
      const { collectionName, keypoints } = newKeypoints;
      const color = isSensitiveAnnotationLabel(collectionName)
        ? ColorsPersonDetection.color
        : newKeypoints.color;
      const structuredNewKeypoints: PredefinedKeypoint[] = keypoints.map(
        (keypoint, index) => ({
          ...keypoint,
          order: `${index + 1}`,
        })
      );
      const duplicates = allKeypointCollections.find(
        (allItem) => allItem.collectionName === collectionName
      );
      if (duplicates) {
        ToastUtils.onFailure(
          `Cannot add ${duplicates.collectionName}, since it already exists!`
        );
      } else {
        setUnsavedKeypointCollections([
          ...unsavedKeypointCollections,
          {
            collectionName,
            color,
            keypoints: structuredNewKeypoints,
          },
        ]);
        setNewKeypoints(undefined);
      }
    }
  };

  const deleteUnsavedKeypointCollection = (name: string) => {
    setUnsavedKeypointCollections(
      unsavedKeypointCollections.filter(
        (collection) => collection.collectionName !== name
      )
    );
  };

  const scrollToBottom = () => {
    const elm = keypointPanelRef.current;
    if (elm) {
      elm.scrollTop = elm.scrollHeight - elm.clientHeight;
    }
  };

  // create new keypoint on settings open
  useEffect(() => {
    if (options) {
      if (!isEmpty(options.createNew)) {
        addNewKeypointGroup(options.createNew);
      }
    }
  }, [options]);

  // set in progress state to disable done button
  useEffect(() => {
    if (newKeypoints) {
      creationInProgress(true);
    } else {
      creationInProgress(false);
    }
  }, [newKeypoints]);

  useEffect(() => {
    scrollToBottom();
  }, [newKeypoints, allKeypointCollections]);

  return (
    <>
      <Header
        title="Keypoints"
        count={allKeypointCollections.length}
        disabledMessage={newKeypoints && 'Finish before creating a new one'}
        onClickNew={() => addNewKeypointGroup()}
      />
      <CollapsePanel ref={keypointPanelRef}>
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
          {allKeypointCollections.length ? (
            allKeypointCollections.map((keypointCollection) => (
              <Panel
                header={
                  <PanelHeader>
                    <Body level={2}>{keypointCollection.collectionName}</Body>
                    <ColorBox color={keypointCollection.color} />
                    {keypointCollection.unsaved && (
                      <Button
                        icon="Delete"
                        onClick={() =>
                          deleteUnsavedKeypointCollection(
                            keypointCollection.collectionName
                          )
                        }
                        size="small"
                        type="ghost-danger"
                        aria-label="deleteButton"
                      />
                    )}
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
                  {keypointCollection.keypoints?.map((keypoint, index) => (
                    <Row
                      key={`${keypointCollection.collectionName} - ${keypoint.caption}`}
                    >
                      <ColorBox color={keypointCollection.color} />
                      <OrderDetail>{index + 1}</OrderDetail>
                      <KeyPointDetail>{keypoint.caption}</KeyPointDetail>
                    </Row>
                  ))}
                </PanelBody>
              </Panel>
            ))
          ) : (
            <EmptyMsgContainer>
              {!newKeypoints && renderEmptyAnnotationMessage('point')}
            </EmptyMsgContainer>
          )}
          {/* New Keypoint Collection */}
          {newKeypoints && (
            <Panel
              collapsible="disabled"
              style={{ background: '#4a67fb14' }}
              header={
                <PanelHeader>
                  <PanelHeaderInput
                    onClick={handleClick}
                    value={newKeypoints.collectionName}
                    placeholder="Create a point group"
                    onChange={(e) => {
                      const { value } = e.target;
                      setNewKeypoints({
                        ...newKeypoints,
                        collectionName: value,
                      });
                    }}
                  />
                  <PanelHeaderActionContainer>
                    {isSensitiveAnnotationLabel(newKeypoints.collectionName) ? (
                      <Tooltip content="color picker is disabled for sensitive labels">
                        <ColorBox color={ColorsPersonDetection.color} />
                      </Tooltip>
                    ) : (
                      <ColorPicker
                        size="16px"
                        color={newKeypoints.color}
                        onChange={(newColor: string) => {
                          updateColor(newColor);
                        }}
                      />
                    )}
                    <Button
                      icon="Delete"
                      onClick={() => setNewKeypoints(undefined)}
                      size="small"
                      type="ghost-danger"
                      aria-label="deleteButton"
                    />
                  </PanelHeaderActionContainer>
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
                {newKeypoints.keypoints.map((keypoint, index) => (
                  <Row key={index.toString()}>
                    <ColorBox
                      color={
                        isSensitiveAnnotationLabel(newKeypoints?.collectionName)
                          ? ColorsPersonDetection.color
                          : newKeypoints.color
                      }
                    />
                    <OrderDetail>{index + 1}</OrderDetail>
                    <KeypointInput
                      size="small"
                      value={keypoint.caption}
                      placeholder="Create individual point"
                      onChange={(e) => {
                        const { value } = e.target;
                        updateCaption(index, value);
                      }}
                    />
                    <Button
                      icon="Delete"
                      onClick={() => onDeleteKeypoint(index)}
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
                    icon="Add"
                    onClick={addNewKeypoint}
                  >
                    Add Point
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
  height: 500px;
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
  width: 34px;
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
const PanelHeaderActionContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 5px;
`;
const KeypointInput = styled(Input)`
  width: 160px;
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
const EmptyMsgContainer = styled.div`
  padding: 10px;
  background: #ffffff;
`;
