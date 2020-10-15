/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext } from 'react';
import { Button, Dropdown, Menu, Icon } from '@cognite/cogs.js';
import {
  CogniteFileViewer,
  ProposedCogniteAnnotation,
  useDownloadPDF,
} from '@cognite/react-picture-annotation';
import { SpacedRow, FilePreviewOverview, Loader } from 'components/Common';
import styled from 'styled-components';
import { useResourceActionsContext } from 'context/ResourceActionsContext';
import { useSelectionButton } from 'hooks/useSelection';
import { Modal, notification } from 'antd';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import { CogniteAnnotation, hardDeleteAnnotations } from '@cognite/annotations';
import { useCdfItem } from 'hooks/sdk';
import { FileInfo } from '@cognite/sdk';
import { useMutation, useQueryCache } from 'react-query';
import { useJob, useFindObjectsJobId } from 'hooks/objectDetection';
import { isModelRunning } from 'types';
import { useSDK } from 'context/sdk';
import DetectObjectsMenuItem from './DetectObjectsMenuItem';

type Props = {
  fileId: number;
  pendingAnnotations: ProposedCogniteAnnotation[];
  setPendingAnnotations: (annos: ProposedCogniteAnnotation[]) => void;
  contextualization: boolean;
  creatable: boolean;
  setCreatable: (creatable: boolean) => void;
};

export const FileOverviewPanel = ({
  fileId,
  pendingAnnotations,
  setPendingAnnotations,
  creatable,
  setCreatable,
  contextualization,
}: Props) => {
  const queryCache = useQueryCache();
  const download = useDownloadPDF();

  const { data: file } = useCdfItem<FileInfo>('files', { id: fileId });

  const sdk = useSDK();
  const [deleteAnnotations] = useMutation(
    () => {
      if (file) {
        return hardDeleteAnnotations(sdk, file);
      }
      return Promise.reject(new Error('file not ready'));
    },
    {
      onSuccess() {
        queryCache.invalidateQueries(['cdf', 'events', 'list']);

        notification.success({
          message: `Successfully cleared annotation for ${file!.name}`,
        });
      },
    }
  );

  const { page, setPage, annotations } = useContext(CogniteFileViewer.Context);

  const { openPreview } = useResourcePreview();
  const renderResourceActions = useResourceActionsContext();
  const selectionButton = useSelectionButton();

  const jobId = useFindObjectsJobId(fileId);
  const { data: job } = useJob(jobId);
  const running = !!jobId && isModelRunning(job?.status);

  const renderMenuButton = () => {
    if (creatable) {
      return (
        <div>
          <Button
            type="primary"
            icon="Check"
            onClick={() => {
              if (pendingAnnotations.length > 0) {
                Modal.confirm({
                  title: 'Are you sure?',
                  content: (
                    <span>
                      Do you want to stop editing? You have pending changes,
                      which will be <strong>deleted</strong> if you leave the
                      editing mode now. Of course, any changes you have already
                      written to CDF have been saved.
                    </span>
                  ),
                  onOk: () => {
                    setCreatable(false);
                    setPendingAnnotations([]);
                  },
                  onCancel: () => {},
                });
              } else {
                setCreatable(false);
              }
            }}
          >
            Finish adding
          </Button>
        </div>
      );
    }

    return (
      <Dropdown
        content={
          <Menu style={{ marginTop: 4 }}>
            {contextualization && (
              <>
                <Menu.Header>Contextualization</Menu.Header>
                <Menu.Item onClick={() => setCreatable(true)}>
                  <Icon type="Plus" />
                  <span>Add new tags</span>
                </Menu.Item>
                {pendingAnnotations.length !== 0 && (
                  <Menu.Item onClick={() => setPendingAnnotations([])}>
                    <Icon type="Delete" />
                    <span>Clear pending tags</span>
                  </Menu.Item>
                )}
                <DetectObjectsMenuItem fileId={fileId} />
                <Menu.Item
                  onClick={() =>
                    Modal.confirm({
                      title: 'Are you sure?',
                      content: (
                        <span>
                          All annotations will be deleted . However, you can
                          always re-contextualize the file.
                        </span>
                      ),
                      onOk: async () => {
                        setCreatable(false);
                        deleteAnnotations();
                      },
                      onCancel: () => {},
                    })
                  }
                >
                  <Icon type="Close" style={{ width: 16 }} />
                  <span>Clear tags</span>
                </Menu.Item>
              </>
            )}
            <Menu.Header>File</Menu.Header>
            <Menu.Submenu
              icon="Download"
              content={
                <Menu>
                  <Menu.Item
                    onClick={() => {
                      if (download) {
                        download(
                          file ? file.name : 'file.pdf',
                          false,
                          false,
                          false
                        );
                      }
                    }}
                  >
                    Original
                  </Menu.Item>
                  <Menu.Item
                    onClick={() => {
                      if (download) {
                        download(
                          file ? file.name : 'file.pdf',
                          false,
                          true,
                          true
                        );
                      }
                    }}
                  >
                    Include annotations
                  </Menu.Item>
                </Menu>
              }
            >
              <span>Download</span>
            </Menu.Submenu>
          </Menu>
        }
        placement="bottom-end"
      >
        <Button
          icon={running ? 'Loading' : 'CaretDown'}
          iconPlacement="right"
          type="primary"
        >
          Actions
        </Button>
      </Dropdown>
    );
  };

  return (
    <OverviewWrapper>
      {file ? (
        <FilePreviewOverview
          file={file}
          page={page}
          annotations={annotations as CogniteAnnotation[]}
          onAssetClicked={item =>
            openPreview({ item: { type: 'asset', id: item.id } })
          }
          onFileClicked={item =>
            openPreview({ item: { type: 'file', id: item.id } })
          }
          onSequenceClicked={item =>
            openPreview({ item: { type: 'sequence', id: item.id } })
          }
          onTimeseriesClicked={item =>
            openPreview({ item: { type: 'timeSeries', id: item.id } })
          }
          onPageChange={setPage}
          extras={
            <SpacedRow>
              {selectionButton({ id: file.id, type: 'file' })}
              {renderResourceActions({ id: file.id, type: 'file' })}
              {renderMenuButton()}
            </SpacedRow>
          }
        />
      ) : (
        <Loader />
      )}
    </OverviewWrapper>
  );
};

const OverviewWrapper = styled.div`
  height: 100%;
  min-width: 360px;
  width: 360px;
  display: inline-flex;
  flex-direction: column;
`;
