import React from 'react';

import styled from 'styled-components';

import { useQuery } from '@tanstack/react-query';

import { Icon, Tooltip, Menu } from '@cognite/cogs.js';
import { IdEither, FileInfo } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { useCdfItem, baseCacheKey } from '@cognite/sdk-react-query-hooks';

export function FileDownloadAnchor({
  id,
  text,
  errorFeedback,
  loadingFeedback,
}: {
  id: IdEither;
  text?: React.ReactElement;
  errorFeedback?: React.ReactElement;
  loadingFeedback?: React.ReactElement;
}) {
  const sdk = useSDK();
  const {
    data: fileInfo,
    isFetched: infoFetched,
    isError: infoError,
  } = useCdfItem<FileInfo>('files', id);
  const {
    data: fileLink,
    isFetched: linkFetched,
    isError: linkError,
  } = useQuery(
    [...baseCacheKey('files'), 'downloadLink', id],
    () => sdk.files.getDownloadUrls([id]).then((r) => r[0]),
    // The retrieved URL becomes invalid after 30 seconds
    { refetchInterval: 25000 }
  );

  if (infoError || linkError) {
    if (errorFeedback) {
      return errorFeedback;
    }

    const tooltipText = infoError
      ? 'Please create a file with a valid id.'
      : 'Nothing to download. You must upload a file first.';

    return (
      <Menu.Item disabled>
        <Tooltip content={tooltipText}>
          <StyledError>
            <span>Download original file</span>
            <Icon type="Info" />
          </StyledError>
        </Tooltip>
      </Menu.Item>
    );
  }
  if (!infoFetched || !linkFetched) {
    if (loadingFeedback) {
      return loadingFeedback;
    }
    return (
      <Menu.Item>
        <Icon type="Loader" />
      </Menu.Item>
    );
  }
  if (infoFetched && linkFetched) {
    return (
      <Menu.Item>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href={fileLink?.downloadUrl}
          download={fileInfo?.name}
        >
          {text || fileInfo?.name}
        </a>
      </Menu.Item>
    );
  }

  return null;
}

const StyledError = styled.span`
  display: inline-flex;
  i {
    margin-left: 4px;
    margin-right: 0;
  }
`;
