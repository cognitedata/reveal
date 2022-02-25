import React from 'react';

import MetadataTable from 'components/metadataTable';
import { useDocumentAssetNames } from 'hooks/useDocumentAssetNames';
import { useDocumentLabelsByExternalIds } from 'hooks/useDocumentLabels';
import { DocumentType } from 'modules/documentSearch/types';

interface Props {
  doc: DocumentType;
  numberOfColumns?: number;
}
export const Metadata: React.FC<Props> = ({ doc, numberOfColumns = 2 }) => {
  const filteredLabels = useDocumentLabelsByExternalIds(doc.doc.labels);
  const { data: assetNames = [] } = useDocumentAssetNames(
    doc.doc.assetIds || []
  );

  return (
    <>
      <MetadataTable
        columns={numberOfColumns}
        metadata={[
          { label: 'Author', value: doc.doc.author },
          { label: 'Location', value: doc.doc.location },
          { label: 'Categories', value: filteredLabels },
          { label: 'Top folder', value: doc.doc.topfolder },
          {
            label: 'File size',
            value: doc.doc.filesize,
            type: 'filesize',
          },
          { label: 'File type', value: doc.doc.filetype },
          {
            label: 'Creation date',
            value: doc.createdDisplay,
            type: 'date',
          },
          {
            label: 'Last modified',
            value: doc.modifiedDisplay,
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
