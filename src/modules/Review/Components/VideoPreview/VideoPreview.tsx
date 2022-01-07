import React, { useState, useEffect } from 'react';
import { CogniteClient, FileInfo } from '@cognite/sdk';
import sdk from '@cognite/cdf-sdk-singleton';
import { Icon } from '@cognite/cogs.js';
import styled from 'styled-components';
import ReactPlayer from 'react-player';

const LoaderContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

type FilePreviewProps = {
  fileObj: FileInfo;
  isLoading: (status: boolean) => void;
};

const LoaderView = () => {
  return (
    <LoaderContainer>
      <Icon type="Loading" />
    </LoaderContainer>
  );
};

export const retrieveDownloadUrl = async (
  client: CogniteClient,
  fileId: number
) => {
  try {
    const result = await client.post(
      // call post directly since getDownloadUrls() does not support extendedExpiration
      `/api/v1/projects/${client.project}/files/downloadlink`,
      {
        data: { items: [{ id: fileId }] },
        params: { extendedExpiration: true },
      }
    );

    const { downloadUrl } = result.data.items[0];
    return downloadUrl;
  } catch {
    // eslint-disable-next-line no-console
    console.log('Could not fetch file');
    return undefined;
  }
};

export const VideoPreview: React.FC<FilePreviewProps> = ({
  fileObj,
  isLoading,
}: FilePreviewProps) => {
  const [url, setUrl] = useState('');

  useEffect(() => {
    retrieveDownloadUrl(sdk, fileObj.id).then((data) => {
      setUrl(data || '');
    });
  }, []);

  return url ? (
    <ReactPlayer
      className="react-player"
      url={url}
      controls
      width="100%"
      height="100%"
      muted
      onReady={() => {
        isLoading(false);
      }}
    />
  ) : (
    LoaderView()
  );
};
