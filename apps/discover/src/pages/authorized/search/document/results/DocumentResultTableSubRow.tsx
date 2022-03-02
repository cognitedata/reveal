import { Row } from 'react-table';

import { getPathsFromDoc } from 'utils/getPathsFromDocument';

import {
  Highlight,
  Metadata,
  FilePath,
  Url,
} from 'components/document-preview';
import { DocumentType } from 'modules/documentSearch/types';
import { MetadataContainer } from 'pages/authorized/search/elements';
import { MarginBottomNormalContainer } from 'styles/layout';

export type Props = {
  row: Row<DocumentType>;
};

export const DocumentResultTableSubRow = ({ row }: Props) => {
  return (
    <MetadataContainer data-testid="document-metadata">
      {row.original.doc.filepath && (
        <FilePath
          paths={getPathsFromDoc(row.original)}
          documentId={row.original.doc.id}
        />
      )}

      <Url url={row.original.doc.url} />

      {row.original.doc.truncatedContent && (
        <MarginBottomNormalContainer>
          <Highlight doc={row.original} />
        </MarginBottomNormalContainer>
      )}

      <Metadata doc={row.original} numberOfColumns={4} />
    </MetadataContainer>
  );
};
