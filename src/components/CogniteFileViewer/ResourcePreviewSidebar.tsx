import React, { useEffect } from 'react';
import { message } from 'antd';
import styled from 'styled-components';
import { CogniteAnnotation } from '@cognite/annotations';
import {
  itemSelector as assetSelector,
  retrieve as retrieveAssets,
  retrieveExternal as retrieveExternalAssets,
} from 'modules/assets';
import {
  itemSelector as timeseriesSelector,
  retrieve as retrieveTimeseries,
  retrieveExternal as retrieveExternalTimeseries,
} from 'modules/timeseries';
import {
  itemSelector as fileSelector,
  retrieve as retrieveFiles,
  retrieveExternal as retrieveExternalFiles,
} from 'modules/files';
import {
  itemSelector as sequenceSelector,
  retrieve as retrieveSequences,
  retrieveExternal as retrieveExternalSequences,
} from 'modules/sequences';
import { useSelector, useDispatch } from 'react-redux';
import {
  create as createAnnotations,
  remove as removeAnnotations,
  selectAnnotations,
} from 'modules/annotations';
import { trackUsage } from 'utils/Metrics';
import { Button, Input } from '@cognite/cogs.js';
import { SmallTitle } from 'components/Common';
import { AssetSmallPreview } from 'containers/Assets';
import { FileSmallPreview } from 'containers/Files/FileSmallPreview';
import { SequenceSmallPreview } from 'containers/Sequences';
import { TimeseriesSmallPreview } from 'containers/Timeseries';
import { ProposedCogniteAnnotation } from 'components/CogniteFileViewer';

const ResourcePreviewWrapper = styled.div<{ hasContent: boolean }>`
  min-width: ${props => (props.hasContent ? '360px' : '0')};
  height: 100%;
  overflow: auto;
  background: #fff;
`;

const CloseButton = styled(Button)`
  float: right;
`;

type Props = {
  fileId?: number;
  selectedAnnotation: ProposedCogniteAnnotation | CogniteAnnotation | undefined;
  pendingPnidAnnotations: ProposedCogniteAnnotation[];
  setPendingPnidAnnotations: (annotations: ProposedCogniteAnnotation[]) => void;
  deselectAnnotation: () => void;
};

export const ResourcePreviewSidebar = ({
  fileId,
  selectedAnnotation,
  pendingPnidAnnotations,
  setPendingPnidAnnotations,
  deselectAnnotation,
}: Props) => {
  const dispatch = useDispatch();
  const getFile = useSelector(fileSelector);
  const getAsset = useSelector(assetSelector);
  const getTimeseries = useSelector(timeseriesSelector);
  const getSequence = useSelector(sequenceSelector);
  const file = getFile(fileId);
  const pnidAnnotations = useSelector(selectAnnotations)(fileId);

  useEffect(() => {
    if (selectedAnnotation) {
      const { resourceId, resourceExternalId } = selectedAnnotation;
      switch (selectedAnnotation.resourceType) {
        case 'asset': {
          if (resourceExternalId) {
            dispatch(
              retrieveExternalAssets([{ externalId: resourceExternalId! }])
            );
          } else if (resourceId) {
            dispatch(retrieveAssets([{ id: resourceId! }]));
          }
          break;
        }
        case 'timeSeries': {
          if (resourceExternalId) {
            dispatch(
              retrieveExternalTimeseries([{ externalId: resourceExternalId! }])
            );
          } else if (resourceId) {
            dispatch(retrieveTimeseries([{ id: resourceId! }]));
          }
          break;
        }
        case 'file': {
          if (resourceExternalId) {
            dispatch(
              retrieveExternalFiles([{ externalId: resourceExternalId! }])
            );
          } else if (resourceId) {
            dispatch(retrieveFiles([{ id: resourceId! }]));
          }
          break;
        }
        case 'sequence': {
          if (resourceExternalId) {
            dispatch(
              retrieveExternalSequences([{ externalId: resourceExternalId! }])
            );
          } else if (resourceId) {
            dispatch(retrieveSequences([{ id: resourceId! }]));
          }
          break;
        }
      }
    }
    window.dispatchEvent(new Event('resize'));
  }, [dispatch, selectedAnnotation]);

  const onSaveDetection = async (
    pendingAnnotation: ProposedCogniteAnnotation | CogniteAnnotation
  ) => {
    if (pendingPnidAnnotations.find(el => el.id === pendingAnnotation.id)) {
      trackUsage('FileViewer.CreateAnnotation', {
        annotation: pendingAnnotation,
      });
      const pendingObj = { ...pendingAnnotation };
      delete pendingObj.id;
      delete pendingObj.metadata;
      dispatch(createAnnotations(file!, [pendingObj]));
      setPendingPnidAnnotations(
        pendingPnidAnnotations.filter(el => el.id !== pendingAnnotation.id)
      );
    } else {
      message.info('Coming Soon');
    }

    // load missing asset information
    if (
      pendingAnnotation.resourceType === 'asset' &&
      (pendingAnnotation.resourceExternalId || pendingAnnotation.resourceId)
    ) {
      const action = pendingAnnotation.resourceExternalId
        ? retrieveExternalAssets([
            { externalId: pendingAnnotation.resourceExternalId! },
          ])
        : retrieveAssets([{ id: pendingAnnotation.resourceId! }]);
      dispatch(action);
    }
  };

  const onDeleteAnnotation = async (
    annotation: ProposedCogniteAnnotation | CogniteAnnotation
  ) => {
    if (pendingPnidAnnotations.find(el => el.id === annotation.id)) {
      setPendingPnidAnnotations(
        pendingPnidAnnotations.filter(el => el.id !== annotation.id)
      );
    } else {
      trackUsage('FileViewer.DeleteAnnotation', {
        annotation,
      });
      const pnidIndex = pnidAnnotations.findIndex(
        el => `${el.id}` === annotation.id
      );
      if (pnidIndex > -1) {
        dispatch(removeAnnotations(file!, [pnidAnnotations[pnidIndex]]));
      }
    }
  };

  const renderExtraContent = (
    annotation: ProposedCogniteAnnotation | CogniteAnnotation
  ): React.ReactNode => {
    if ('metadata' in annotation) {
      const { score, fromSimilarJob } = annotation.metadata!;
      if (fromSimilarJob) {
        return (
          <div style={{ paddingLeft: '16px', paddingRight: '16px' }}>
            <SmallTitle>From Similar Object</SmallTitle>
            <p>Score: {Math.round((Number(score) + Number.EPSILON) * 100)}%</p>
          </div>
        );
      }
    }
    return null;
  };
  let content: React.ReactNode = null;
  if (selectedAnnotation) {
    if (typeof selectedAnnotation.id === 'number') {
      switch (selectedAnnotation.resourceType) {
        case 'asset': {
          const asset = getAsset(
            selectedAnnotation.resourceExternalId || selectedAnnotation.id
          );
          if (asset) {
            content = (
              <AssetSmallPreview assetId={asset.id}>
                {renderExtraContent(selectedAnnotation)}
              </AssetSmallPreview>
            );
          }
          break;
        }
        case 'file': {
          const previewFile = getFile(
            selectedAnnotation.resourceExternalId || selectedAnnotation.id
          );
          if (previewFile) {
            content = (
              <FileSmallPreview fileId={previewFile.id}>
                {renderExtraContent(selectedAnnotation)}
              </FileSmallPreview>
            );
          }
          break;
        }
        case 'sequence': {
          const sequence = getSequence(
            selectedAnnotation.resourceExternalId || selectedAnnotation.id
          );
          if (sequence) {
            content = (
              <SequenceSmallPreview sequenceId={sequence.id}>
                {renderExtraContent(selectedAnnotation)}
              </SequenceSmallPreview>
            );
          }
          break;
        }
        case 'timeSeries': {
          const timeseries = getTimeseries(
            selectedAnnotation.resourceExternalId || selectedAnnotation.id
          );
          if (timeseries) {
            content = (
              <TimeseriesSmallPreview timeseriesId={timeseries.id}>
                {renderExtraContent(selectedAnnotation)}
              </TimeseriesSmallPreview>
            );
          }
          break;
        }
      }
    } else {
      content = (
        <>
          <Input placeholder="Label" />
          <Input placeholder="Description" />
          <Button onClick={() => onDeleteAnnotation(selectedAnnotation)}>
            Delete
          </Button>
          <Button onClick={() => onSaveDetection(selectedAnnotation)}>
            Create
          </Button>
        </>
      );
    }
  }
  return (
    <ResourcePreviewWrapper hasContent={!!content}>
      {content && (
        <CloseButton
          icon="Close"
          variant="ghost"
          onClick={() => deselectAnnotation()}
        />
      )}
      {content}
    </ResourcePreviewWrapper>
  );
};
