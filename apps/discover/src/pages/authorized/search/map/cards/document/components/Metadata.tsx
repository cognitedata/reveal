import React from 'react';

import MetadataTable from 'components/metadataTable';
import { useDocumentAssetNames } from 'hooks/useDocumentAssetNames';
import { useDocumentLabelsByExternalIds } from 'hooks/useDocumentLabels';
import { DocumentType } from 'modules/documentSearch/types';

interface Props {
  doc: DocumentType;
  numberOfColumns?: number;
}
export const Metadata: React.FC<Props> = ({
  doc: { doc: defaultMetadata },
  numberOfColumns = 2,
}) => {
  const filteredLabels = useDocumentLabelsByExternalIds(defaultMetadata.labels);
  const { data: assetNames = [] } = useDocumentAssetNames(
    defaultMetadata.assetIds || []
  );

  return (
    <>
      <MetadataTable
        columns={numberOfColumns}
        metadata={[
          { label: 'Author', value: defaultMetadata.author },
          { label: 'Location', value: defaultMetadata.location },
          { label: 'Categories', value: filteredLabels },
          { label: 'Top folder', value: defaultMetadata.topfolder },
          {
            label: 'File size',
            value: defaultMetadata.filesize,
            type: 'filesize',
          },
          { label: 'File type', value: defaultMetadata.filetype },
          {
            label: 'Creation date',
            value: defaultMetadata.creationdate,
            type: 'date',
          },
          {
            label: 'Last modified',
            value: defaultMetadata.lastmodified,
            type: 'date',
          },
        ]}
      />
      <MetadataTable
        columns={1}
        metadata={[
          {
            label: 'Assets',
            value: assetNames,
            type: 'date',
          },
        ]}
      />
    </>
  );
};
