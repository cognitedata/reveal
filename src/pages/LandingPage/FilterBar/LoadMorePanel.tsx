import React, { useState } from 'react';
import { Button, Tooltip, Icon, Body } from '@cognite/cogs.js';
import { TOOLTIP_STRINGS } from 'stringConstants';
import { PNID_METRICS, trackUsage } from 'utils/Metrics';
import { FileWithAnnotations, chunkSize } from 'hooks';
import { LoadMoreWrapper } from '../components';

type Props = {
  total: number;
  files: FileWithAnnotations[];
  loadChunk: number;
  setLoadChunk: (loadChunk: number) => void;
};

export const LoadMorePanel = (props: Props) => {
  const { total, files, loadChunk, setLoadChunk } = props;
  const [hidePanel, setHidePanel] = useState<boolean>(false);
  const isLoadMoreDisabled = total <= chunkSize * (loadChunk + 1);

  const onClickLoadMore = () => {
    trackUsage(PNID_METRICS.landingPage.loadMore, {
      chunk: loadChunk + 1,
    });
    setLoadChunk(loadChunk + 1);
  };

  if (hidePanel) return <span />;
  return (
    <LoadMoreWrapper disabled={isLoadMoreDisabled}>
      <Body
        level={2}
        style={{
          marginRight: '5px',
          color: isLoadMoreDisabled ? 'black' : '#F5F5F5',
        }}
      >
        <b>{files.length}</b> files loaded.
      </Body>
      {isLoadMoreDisabled ? (
        <>
          <Body level={2} style={{ marginRight: '5px', color: '#8C8C8C' }}>
            All files are loaded{' '}
          </Body>
          <Tooltip content="Hide">
            <Icon
              type="Close"
              style={{ verticalAlign: '-0.225em', cursor: 'pointer' }}
              onClick={() => setHidePanel(true)}
            />
          </Tooltip>
        </>
      ) : (
        <>
          <Button onClick={onClickLoadMore}>Load more</Button>
          <Tooltip content={TOOLTIP_STRINGS.LOAD_MORE_FILES_TOOLTIP}>
            <Icon type="Info" style={{ verticalAlign: '-0.225em' }} />
          </Tooltip>
        </>
      )}
    </LoadMoreWrapper>
  );
};
