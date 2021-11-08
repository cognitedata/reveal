import React from 'react';

import { FilePath } from 'components/document-info-panel/FilePath';
import MetadataTable from 'components/metadataTable';
import { useDocumentLabelsByExternalIds } from 'hooks/useDocumentLabels';
import { FavoriteDocumentData } from 'modules/favorite/types';

import { MetadataWrapper, FilePathWrapper } from '../../../elements';

interface Props {
  data: FavoriteDocumentData;
}
export const Metadata: React.FC<Props> = ({ data }) => {
  /**
   * According to the types, label should be a String but in reality
   * it's { externalId: string }. To fix, we should rewrite
   * DocumentMetadata and DocumentType (possibly merge them)
   * in src/modules/documentSearch/types.ts
   *
   * https://cognitedata.atlassian.net/browse/PP-1232
   */
  const filteredLabels =
    data.labels && useDocumentLabelsByExternalIds(data.labels);

  return (
    <MetadataWrapper>
      {data.path && (
        <FilePathWrapper>
          <FilePath paths={[data.path]} documentId={data.id.toString()} />
        </FilePathWrapper>
      )}
      <MetadataTable
        columns={4}
        metadata={[
          { label: 'Author', value: data.author },
          { label: 'Location', value: data.location },
          { label: 'Categories', value: filteredLabels },
          {
            label: 'Top folder',
            value: data.topfolder,
          },
          {
            label: 'File size',
            value: data?.filesize,
            type: 'filesize',
          },
          {
            label: 'File type',
            value: data.type,
          },
          {
            label: 'Creation date',
            value: data.created && new Date(data.created).toISOString(),
            type: 'date',
          },
          {
            label: 'Last modified',
            value: data.lastUpdated && new Date(data.lastUpdated).toISOString(),
            type: 'date',
          },
        ]}
      />
    </MetadataWrapper>
  );
};
