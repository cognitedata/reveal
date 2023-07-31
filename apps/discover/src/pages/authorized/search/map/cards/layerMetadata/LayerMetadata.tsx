import { useMemo } from 'react';
import * as React from 'react';

import { Title } from '@cognite/cogs.js';

import BasePreviewCard from '../../../../../../components/Card/PreviewCard';
import MetadataTable from '../../../../../../components/MetadataTable';

interface Props {
  properties: Record<string, any>;
  title: string;
  onCloseClick?: () => void;
}
export const LayerMetadata: React.FC<Props> = ({
  title,
  properties,
  onCloseClick,
}) => {
  const metadata = useMemo(() => {
    return Object.keys(properties).reduce((result, key) => {
      if (properties[key]) {
        return [
          ...result,
          {
            label: key,
            value:
              typeof properties[key] === 'object'
                ? JSON.stringify(properties[key], null, 2)
                : properties[key].toString(),
            type: 'text',
          },
        ];
      }

      return result;
    }, [] as { label: string; value: string }[]);
  }, [properties.id]);

  return (
    <BasePreviewCard
      title={title}
      hideCopyToClipboardButton
      handleCloseClick={onCloseClick}
      icon="Layers"
    >
      <div style={{ overflow: 'auto', paddingTop: '10px', maxHeight: '500px' }}>
        <Title level={5} style={{ paddingBottom: '10px' }}>
          Properties
        </Title>
        <MetadataTable metadata={metadata} columns={2} />
      </div>
    </BasePreviewCard>
  );
};
