import { useEffect, useState } from 'react';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Flex } from '@cognite/cogs.js';
import { FilePreview } from '@cognite/data-exploration';

import { getCogniteSDKClient } from '../../../../../../environments/cogniteSdk';

export const FileNode = ({ externalId }: { externalId: string }) => {
  const [resourceId, setResourceId] = useState<number | undefined>();
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    getCogniteSDKClient()
      .files.retrieve([{ externalId }])
      .then(([{ id }]) => setResourceId(id));
  }, [externalId]);

  return (
    <Flex direction="column" gap={4}>
      <Flex gap={6}>
        <Button
          style={{ flex: 1 }}
          size="small"
          disabled={!resourceId}
          icon={isOpen ? 'ChevronUp' : 'ChevronDown'}
          onClick={() => setIsOpen(!isOpen)}
        />
        <Button
          style={{ flex: 1 }}
          size="small"
          icon="ExternalLink"
          disabled={!resourceId}
          onClick={() => window.open(createLink(`/explore/file/${resourceId}`))}
        />
      </Flex>
      {isOpen && resourceId && (
        <div style={{ height: 100 }}>
          <FilePreview
            fileId={resourceId}
            id={`Preview${resourceId}`}
            applicationId="platypus"
            contextualization={false}
            creatable={false}
            showControls={false}
            showDownload={false}
            showSideBar={false}
            enableZoomToAnnotation={false}
            enableToolTips={false}
            hideEdit
          />
        </div>
      )}
    </Flex>
  );
};
