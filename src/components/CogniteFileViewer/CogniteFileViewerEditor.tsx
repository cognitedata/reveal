import React, { useState, useEffect, useRef } from 'react';
import { message } from 'antd';
import styled from 'styled-components';
import { CogniteAnnotation, getPnIDAnnotationType } from '@cognite/annotations';
import { useSelector, useDispatch } from 'react-redux';
import {
  Button,
  Icon,
  Colors,
  Dropdown,
  Menu,
  Title,
  AllIconTypes,
} from '@cognite/cogs.js';
import {
  retrieve as assetRetrieve,
  retrieveExternal as assetExternalRetrieve,
  itemSelector as assetItemSelector,
} from 'modules/assets';
import {
  itemSelector as fileItemSelector,
  retrieve as fileRetrieve,
  retrieveExternal as fileExternalRetrieve,
} from 'modules/files';
import {
  itemSelector as sequenceItemSelector,
  retrieve as sequenceRetrieve,
  retrieveExternal as sequenceExternalRetrieve,
} from 'modules/sequences';
import {
  AssetHoverPreview,
  FileHoverPreview,
  SequenceHoverPreview,
  RenderResourceActionsFunction,
} from 'containers/HoverPreview';
import { onResourceSelected } from 'modules/app';
import { FilesMetadata, Asset, Sequence } from '@cognite/sdk';
import { SmallTitle } from 'components/Common';
import { useHistory } from 'react-router-dom';
import { ProposedCogniteAnnotation } from './CogniteFileViewer';
import { selectAnnotationColor } from './CogniteFileViewerUtils';
import { CogniteFileViewerEditorSelect } from './CogniteFileViewerEditorSelect';

const WrappedPopover = styled.div<{ maxHeight?: number | string }>`
  position: relative;
  width: 340px;
  max-height: ${props => props.maxHeight};
  overflow: auto;
  background: #fff;
  box-shadow: 0px 0px 4px #cdcdcd;
  overflow: auto;
  && > div {
    display: flex;
    overflow: hidden;
    max-height: ${props => props.maxHeight};
  }

  .button-row {
    & > * {
      margin-right: 6px;
      margin-bottom: 6px;
      display: inline-flex;
    }
    & > *:nth-last-child(1) {
      margin-left: 0px;
    }
  }
`;

const Indicator = styled.div`
  padding-right: 16px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;

  && > div {
    width: 16px;
    height: 16px;
    display: inline-block;
    margin-right: 4px;
  }
`;

export type ExtraEditorOption = {
  key: string;
  action: string;
  onClick: () => void;
  icon?: AllIconTypes;
};

type Props = {
  annotation: ProposedCogniteAnnotation | CogniteAnnotation;
  onUpdateDetection: (
    annotation: ProposedCogniteAnnotation | CogniteAnnotation
  ) => void;
  onDeleteDetection: () => void;
  extraActions?: ExtraEditorOption[];
  children?: React.ReactNode;
  onFileClicked?: (file: FilesMetadata) => void;
  onSequenceClicked?: (sequence: Sequence) => void;
  onAssetClicked?: (asset: Asset) => void;
  renderResourceActions?: RenderResourceActionsFunction;
  height: number | string | undefined;
};

export const CogniteFileViewerEditor = ({
  annotation,
  onUpdateDetection,
  onDeleteDetection,
  extraActions,
  children,
  height,
  onFileClicked,
  onAssetClicked,
  onSequenceClicked,
  renderResourceActions = () => [],
}: Props) => {
  const dispatch = useDispatch();
  const history = useHistory();
  const wrapper = useRef<HTMLDivElement>(null);

  const getAsset = useSelector(assetItemSelector);
  const getFile = useSelector(fileItemSelector);
  const getSequence = useSelector(sequenceItemSelector);

  const [label, setLabel] = useState(annotation ? annotation.label : undefined);
  const [assetId, setAssetId] = useState<number | undefined>(undefined);
  const [fileId, setFileId] = useState<number | undefined>(undefined);
  const [sequenceId, setSequenceId] = useState<number | undefined>(undefined);
  const currentAsset = assetId ? getAsset(assetId) : undefined;
  const currentFile = fileId ? getFile(fileId) : undefined;
  const currentSequence = sequenceId ? getSequence(sequenceId) : undefined;
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const hasLinkedData = !!annotation.resourceType;

  useEffect(() => {
    setLabel(annotation.label);
  }, [annotation]);

  useEffect(() => {
    switch (annotation.resourceType) {
      case 'asset': {
        const asset = getAsset(
          annotation.resourceExternalId || annotation.resourceId
        );
        if (asset) {
          setAssetId(asset.id);
        } else {
          setAssetId(undefined);
        }
        break;
      }
      case 'file': {
        const file = getFile(
          annotation.resourceExternalId || annotation.resourceId
        );
        if (file) {
          setFileId(file.id);
        } else {
          setFileId(undefined);
        }
        break;
      }
      case 'sequence': {
        const sequence = getSequence(
          annotation.resourceExternalId || annotation.resourceId
        );
        if (sequence) {
          setSequenceId(sequence.id);
        } else {
          setSequenceId(undefined);
        }
        break;
      }
    }
  }, [annotation, getAsset, getFile, getSequence]);

  useEffect(() => {
    switch (annotation.resourceType) {
      case 'asset': {
        if (annotation.resourceExternalId) {
          dispatch(
            assetExternalRetrieve([
              { externalId: annotation.resourceExternalId! },
            ])
          );
        } else {
          dispatch(assetRetrieve([{ id: annotation.resourceId! }]));
        }
        break;
      }
      case 'file': {
        if (annotation.resourceExternalId) {
          dispatch(
            fileExternalRetrieve([
              { externalId: annotation.resourceExternalId! },
            ])
          );
        } else {
          dispatch(fileRetrieve([{ id: annotation.resourceId! }]));
        }
        break;
      }
      case 'sequence': {
        if (annotation.resourceExternalId) {
          dispatch(
            sequenceExternalRetrieve([
              { externalId: annotation.resourceExternalId! },
            ])
          );
        } else {
          dispatch(sequenceRetrieve([{ id: annotation.resourceId! }]));
        }
        break;
      }
    }
  }, [annotation, dispatch]);

  const isNewDetection = Number.isNaN(Number(annotation.id));

  const extraOverflowMenuItems = (extraActions || []).map(el => (
    <Menu.Item key={el.key} onClick={el.onClick} appendIcon={el.icon}>
      {el.action}
    </Menu.Item>
  ));

  const ellipsisActions = (
    <Menu>
      {extraOverflowMenuItems}
      <Menu.Item
        key="edit"
        onClick={() => setIsEditing(true)}
        appendIcon="Edit"
      >
        Edit
      </Menu.Item>
      <Menu.Item
        key="delete"
        onClick={() => onDeleteDetection()}
        appendIcon="Delete"
      >
        Delete
      </Menu.Item>
    </Menu>
  );

  let content = (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column' }}>
      <Title level={4}>{annotation.label}</Title>
      {hasLinkedData ? (
        <Icon
          type="Loading"
          style={{ width: '24px', color: Colors['greyscale-grey6'].hex() }}
        />
      ) : (
        <div className="button-row" style={{ marginTop: 12 }}>
          <Button
            key="edit"
            onClick={() => setIsEditing(true)}
            icon="Edit"
            type="primary"
          >
            Edit
          </Button>
          <Button
            key="delete"
            onClick={() => onDeleteDetection()}
            icon="Delete"
            type="danger"
          />
          {(extraActions || []).map(el => (
            <Button key={el.key} onClick={el.onClick} icon={el.icon}>
              {el.action}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
  if (isEditing || isNewDetection || 'fromSimilarObject' in annotation) {
    content = (
      <div
        style={{ padding: '12px', display: 'flex', flexDirection: 'column' }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <SmallTitle style={{ flex: 1, marginRight: 12 }}>
            Choose which asset or file to link to
          </SmallTitle>
          <Dropdown content={<Menu>{extraOverflowMenuItems}</Menu>} key="extra">
            <Button icon="VerticalEllipsis" />
          </Dropdown>
        </div>
        <Indicator>
          <div
            style={{
              backgroundColor: selectAnnotationColor(annotation),
              marginRight: '8px',
            }}
          />
          {getPnIDAnnotationType(annotation)}
        </Indicator>
        <CogniteFileViewerEditorSelect
          fileId={fileId}
          assetId={assetId}
          label={label}
          setFileId={setFileId}
          setAssetId={setAssetId}
          setLabel={setLabel}
        />
        <div className="button-row" style={{ display: 'flex', marginTop: 12 }}>
          {!isNewDetection && (
            <Button onClick={() => setIsEditing(false)}>Cancel</Button>
          )}
          <div style={{ flex: 1 }} />
          <Button
            type="primary"
            icon={isNewDetection ? 'Plus' : 'Edit'}
            loading={loading}
            onClick={async () => {
              setLoading(true);
              if (label) {
                const asset = getAsset(assetId);
                const file = getFile(fileId);
                await onUpdateDetection({
                  ...annotation,
                  label,
                  ...(asset && {
                    resourceType: 'asset',
                    resourceExternalId: asset.externalId,
                    resurceId: asset.id,
                  }),
                  ...(file && {
                    resourceType: 'file',
                    resourceExternalId: file.externalId,
                    resurceId: file.id,
                  }),
                });
              } else {
                message.error('A label must be provided');
              }
              setLoading(false);
            }}
          >
            {isNewDetection ? 'Add Tag Link' : 'Edit Tag Link'}
          </Button>
          <Button icon="Delete" onClick={() => onDeleteDetection()} />
        </div>
        {children}
      </div>
    );
  } else {
    const popoverActions = renderResourceActions({
      assetId: currentAsset && currentAsset.id,
      fileId: currentFile && currentFile.id,
    });
    if (currentAsset) {
      content = (
        <div>
          <AssetHoverPreview
            asset={currentAsset}
            disableSidebarToggle
            extras={[
              <Dropdown content={ellipsisActions} key="extra">
                <Button icon="VerticalEllipsis" />
              </Dropdown>,
            ]}
            renderResourceActions={renderResourceActions}
            actions={[
              <Button
                key="open"
                onClick={() => {
                  if (onAssetClicked) {
                    onAssetClicked(currentAsset!);
                  } else {
                    dispatch(
                      onResourceSelected(
                        {
                          showSidebar: true,
                          assetId: currentAsset.id,
                        },
                        history
                      )
                    );
                  }
                }}
                icon="PanelRight"
              >
                More Details
              </Button>,
              ...popoverActions,
            ]}
          />
          {children}
        </div>
      );
    }
    if (currentFile) {
      content = (
        <div>
          <FileHoverPreview
            file={currentFile}
            disableSidebarToggle
            extras={[
              <Dropdown content={ellipsisActions} key="extra">
                <Button icon="VerticalEllipsis" />
              </Dropdown>,
            ]}
            actions={[
              <Button
                key="open"
                onClick={() => {
                  if (onFileClicked) {
                    onFileClicked(currentFile!);
                  } else {
                    dispatch(
                      onResourceSelected(
                        {
                          showSidebar: true,
                          fileId: currentFile.id,
                        },
                        history
                      )
                    );
                  }
                }}
                icon="Select"
              >
                Open File
              </Button>,
              ...popoverActions,
            ]}
          />
          {children}
        </div>
      );
    }
    if (currentSequence) {
      content = (
        <div>
          <SequenceHoverPreview
            sequence={currentSequence}
            disableSidebarToggle
            extras={[
              <Dropdown content={ellipsisActions} key="extra">
                <Button icon="VerticalEllipsis" />
              </Dropdown>,
            ]}
            actions={[
              <Button
                key="open"
                onClick={() => {
                  if (onSequenceClicked) {
                    onSequenceClicked(currentSequence!);
                  } else {
                    dispatch(
                      onResourceSelected(
                        {
                          showSidebar: true,
                          sequenceId: currentSequence.id,
                        },
                        history
                      )
                    );
                  }
                }}
                icon="Select"
              >
                Open Sequence
              </Button>,
              ...popoverActions,
            ]}
          />
          {children}
        </div>
      );
    }
  }
  return (
    <WrappedPopover maxHeight={height} ref={wrapper}>
      {content}
    </WrappedPopover>
  );
};
