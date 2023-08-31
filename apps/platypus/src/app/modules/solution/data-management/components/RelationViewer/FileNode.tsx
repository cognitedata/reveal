import { useEffect, useState } from 'react';

import { createLink } from '@cognite/cdf-utilities';
import { Button, Flex } from '@cognite/cogs.js';

import { getCogniteSDKClient } from '../../../../../../environments/cogniteSdk';
import { FilePreview } from '../../../../../components/FilePreview/FilePreview';

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
      {isOpen && externalId && (
        <div style={{ height: 100, display: 'flex' }}>
          <FilePreview fileId={externalId} sdk={getCogniteSDKClient()} />
        </div>
      )}
    </Flex>
  );
};
