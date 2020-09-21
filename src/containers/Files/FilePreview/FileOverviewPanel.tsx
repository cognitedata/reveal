/* eslint-disable react/jsx-props-no-spreading */
import React, { useContext, useMemo } from 'react';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import { itemSelector } from '@cognite/cdf-resources-store/dist/files';
import { Button, Dropdown, Menu, Icon, AllIconTypes } from '@cognite/cogs.js';
import { hardDeleteAnnotationsForFile } from 'modules/annotations';
import {
  CogniteFileViewer,
  ProposedCogniteAnnotation,
  useDownloadPDF,
} from '@cognite/react-picture-annotation';
import { SpacedRow, FilePreviewOverview, Loader } from 'components/Common';
import styled from 'styled-components';
import { useResourceActionsContext } from 'context/ResourceActionsContext';
import { useSelectionButton } from 'hooks/useSelection';
import { Modal, message } from 'antd';
import { useResourcePreview } from 'context/ResourcePreviewContext';
import { CogniteAnnotation } from '@cognite/annotations';
import {
  detectObject,
  selectObjectJobForFile,
} from 'modules/fileContextualization/objectDetectionJob';

type Props = {
  fileId?: number;
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
  const dispatch = useResourcesDispatch();
  const download = useDownloadPDF();
  const file = useResourcesSelector(itemSelector)(fileId);

  const { page, setPage, annotations } = useContext(CogniteFileViewer.Context);

  const { openPreview } = useResourcePreview();
  const renderResourceActions = useResourceActionsContext();
  const selectionButton = useSelectionButton();

  const detectObjectJob = useResourcesSelector(selectObjectJobForFile)(fileId);

  const detectObjectJobIcon: AllIconTypes = useMemo(() => {
    if (!detectObjectJob) {
      return 'ThreeD';
    }
    if (detectObjectJob.jobError) {
      return 'Beware';
    }
    if (detectObjectJob.jobDone) {
      return 'Check';
    }
    return 'Loading';
  }, [detectObjectJob]);

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
                <Menu.Item onClick={() => dispatch(detectObject(fileId!))}>
                  <Icon type={detectObjectJobIcon} />
                  <span>Detect objects</span>
                </Menu.Item>
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
                        await dispatch(hardDeleteAnnotationsForFile(file!));
                        message.success(
                          `Successfully cleared annotation for ${file!.name}`
                        );
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
        <Button icon="CaretDown" iconPlacement="right" type="primary">
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
