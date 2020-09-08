import React, { useEffect } from 'react';
import styled from 'styled-components';
import {
  itemSelector as assetSelector,
  retrieve as retrieveAssets,
} from 'modules/assets';
import {
  itemSelector as timeseriesSelector,
  retrieve as retrieveTimeseries,
} from 'modules/timeseries';
import {
  itemSelector as fileSelector,
  retrieve as retrieveFiles,
} from 'modules/files';
import {
  itemSelector as sequenceSelector,
  retrieve as retrieveSequences,
} from 'modules/sequences';
import {
  itemSelector as eventSelector,
  retrieve as retrieveEvents,
} from 'modules/events';
import { useSelector, useDispatch } from 'react-redux';
import { Button, Graphic } from '@cognite/cogs.js';
import { AssetSmallPreview } from 'containers/Assets';
import { FileSmallPreview } from 'containers/Files/FileSmallPreview';
import { SequenceSmallPreview } from 'containers/Sequences';
import { TimeseriesSmallPreview } from 'containers/Timeseries';
import { Loader } from 'components/Common';
import { ResourceItem } from 'types';
import { EventSmallPreview } from 'containers/Events';

type Props = {
  item?: ResourceItem;
  placeholder?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  content?: React.ReactNode;
  onClose: () => void;
};

export const ResourcePreviewSidebar = ({
  item,
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
  const dispatch = useDispatch();
  const getFile = useSelector(fileSelector);
  const getAsset = useSelector(assetSelector);
  const getTimeseries = useSelector(timeseriesSelector);
  const getSequence = useSelector(sequenceSelector);
  const getEvent = useSelector(eventSelector);

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
      <CloseButton icon="Close" variant="ghost" onClick={onClose} />
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
`;

const CloseButton = styled(Button)`
  align-self: flex-end;
`;
