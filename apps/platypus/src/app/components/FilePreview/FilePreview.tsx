import { useEffect, useMemo, useState } from 'react';

import { useQuery } from '@tanstack/react-query';

import { CogniteClient, FileInfo } from '@cognite/sdk';
import ReactUnifiedViewer, {
  getContainerConfigFromFileInfo,
  isSupportedFileInfo,
} from '@cognite/unified-file-viewer';

const getContainerId = (fileId: number) => {
  return String(fileId);
};

const MAX_CONTAINER_WIDTH = 5000;
const MAX_CONTAINER_HEIGHT = 5000;

const useFileContainerQuery = (sdk: CogniteClient, file?: FileInfo) => {
  return useQuery(
    ['FILE_CONTAINER', file?.id],
    async () => {
      if (file === undefined) {
        return Promise.reject(new Error('File id not found in conatiner'));
      }

      const results = await getContainerConfigFromFileInfo(sdk as any, file, {
        id: getContainerId(file.id),
        maxWidth: MAX_CONTAINER_WIDTH,
        maxHeight: MAX_CONTAINER_HEIGHT,
      });

      return results;
    },
    {
      enabled: file !== undefined,
    }
  );
};

const UFV_APPLICATION_ID = 'PLATYPUS';

export const FilePreview = ({
  fileId,
  sdk,
}: {
  fileId: string;
  sdk: CogniteClient;
}) => {
  const [file, setFile] = useState<FileInfo | undefined>(undefined);
  const { data: containerData } = useFileContainerQuery(sdk, file);
  useEffect(() => {
    sdk.files
      .retrieve([{ externalId: fileId }])
      .then(([newFile]) => setFile(newFile));
  }, [fileId, sdk]);

  const container = useMemo(() => {
    if (file && isSupportedFileInfo(file)) {
      return containerData;
    }
    return undefined;
  }, [file, containerData]);

  if (!container) return null;

  return (
    <ReactUnifiedViewer
      applicationId={UFV_APPLICATION_ID}
      id={fileId}
      containers={[container]}
      shouldShowZoomControls={false}
    />
  );
};
