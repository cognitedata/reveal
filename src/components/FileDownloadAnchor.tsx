import React from 'react';
import { Icon, Colors } from '@cognite/cogs.js';
import { IdEither, FileInfo } from '@cognite/sdk';
import { useCdfItem, baseCacheKey } from '@cognite/sdk-react-query-hooks';
import { useQuery } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';

export default function FileDownloadAnchor({
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
    () => sdk.files.getDownloadUrls([id]).then(r => r[0]),
    // The retrieved URL becomes invalid after 30 seconds
    { refetchInterval: 25000 }
  );

  if (infoError || linkError) {
    if (errorFeedback) {
      return errorFeedback;
    }
    return <Icon style={{ color: Colors.danger }} type="ErrorStroked" />;
  }
  if (!infoFetched || !linkFetched) {
    if (loadingFeedback) {
      return loadingFeedback;
    }
    return (
      <Icon style={{ color: Colors['greyscale-grey4'].hex() }} type="Loading" />
    );
  }
  if (infoFetched && linkFetched) {
    return (
      <a
        target="_blank"
        rel="noopener noreferrer"
        href={fileLink?.downloadUrl}
        download={fileInfo?.name}
      >
        {text || fileInfo?.name}
      </a>
    );
  }

  return null;
}
