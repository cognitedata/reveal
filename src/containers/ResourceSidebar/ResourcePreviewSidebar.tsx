import React, { useEffect } from 'react';
import styled from 'styled-components';
import {
  itemSelector as assetSelector,
  retrieve as retrieveAssets,
} from '@cognite/cdf-resources-store/dist/assets';
import {
  itemSelector as timeseriesSelector,
  retrieve as retrieveTimeseries,
} from '@cognite/cdf-resources-store/dist/timeseries';
import {
  itemSelector as fileSelector,
  retrieve as retrieveFiles,
} from '@cognite/cdf-resources-store/dist/files';
import {
  itemSelector as sequenceSelector,
  retrieve as retrieveSequences,
} from '@cognite/cdf-resources-store/dist/sequences';
import {
  itemSelector as eventSelector,
  retrieve as retrieveEvents,
} from '@cognite/cdf-resources-store/dist/events';
import {
  useResourcesSelector,
  useResourcesDispatch,
} from '@cognite/cdf-resources-store';
import { Button, Graphic } from '@cognite/cogs.js';
import { AssetSmallPreview } from 'containers/Assets';
import { FileSmallPreview } from 'containers/Files';
import { SequenceSmallPreview } from 'containers/Sequences';
import { TimeseriesSmallPreview } from 'containers/Timeseries';
import { EventSmallPreview } from 'containers/Events';
import { Loader } from 'components/Common';
import { ResourceItem } from 'types';

type Props = {
  item?: ResourceItem;
  closable?: boolean;
  placeholder?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  content?: React.ReactNode;
  onClose: () => void;
};

export const ResourcePreviewSidebar = ({
  item,
  closable = true,
  placeholder = (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Graphic type="Search" />
      <p>No resource to preview.</p>
    </div>
  ),
  header,
  footer,
  content: propContent,
  onClose,
}: Props) => {
  const dispatch = useResourcesDispatch();
  const getFile = useResourcesSelector(fileSelector);
  const getAsset = useResourcesSelector(assetSelector);
  const getTimeseries = useResourcesSelector(timeseriesSelector);
  const getSequence = useResourcesSelector(sequenceSelector);
  const getEvent = useResourcesSelector(eventSelector);

  useEffect(() => {
    if (item) {
      switch (item.type) {
        case 'asset': {
          dispatch(retrieveAssets([{ id: item.id! }]));
          break;
        }
        case 'timeSeries': {
          dispatch(retrieveTimeseries([{ id: item.id! }]));
          break;
        }
        case 'file': {
          dispatch(retrieveFiles([{ id: item.id! }]));
          break;
        }
        case 'sequence': {
          dispatch(retrieveSequences([{ id: item.id! }]));
          break;
        }
        case 'event': {
          dispatch(retrieveEvents([{ id: item.id! }]));
          break;
        }
      }
    }
  }, [dispatch, item]);

  let content: React.ReactNode = placeholder || <Loader />;
  if (item) {
    switch (item.type) {
      case 'asset': {
        const asset = getAsset(item.id);
        if (asset) {
          content = <AssetSmallPreview assetId={asset.id} />;
        }
        break;
      }
      case 'file': {
        const previewFile = getFile(item.id);
        if (previewFile) {
          content = <FileSmallPreview fileId={previewFile.id} />;
        }
        break;
      }
      case 'sequence': {
        const sequence = getSequence(item.id);
        if (sequence) {
          content = <SequenceSmallPreview sequenceId={sequence.id} />;
        }
        break;
      }
      case 'timeSeries': {
        const timeseries = getTimeseries(item.id);
        if (timeseries) {
          content = <TimeseriesSmallPreview timeseriesId={timeseries.id} />;
        }
        break;
      }
      case 'event': {
        const event = getEvent(item.id);
        if (event) {
          content = <EventSmallPreview eventId={event.id} />;
        }
        break;
      }
    }
  }

  return (
    <ResourcePreviewWrapper>
      {closable && (
        <CloseButton icon="Close" variant="ghost" onClick={onClose} />
      )}
      {header}
      {propContent || content}
      {footer}
    </ResourcePreviewWrapper>
  );
};

const ResourcePreviewWrapper = styled.div`
  height: 100%;
  min-width: 360px;
  overflow: auto;
  background: #fff;
  display: flex;
  flex-direction: column;
  position: relative;
`;

const CloseButton = styled(Button)`
  align-self: flex-end;
`;
