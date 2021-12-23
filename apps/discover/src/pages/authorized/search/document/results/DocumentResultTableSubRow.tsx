import { getPathsFromDoc } from '_helpers/getPathsFromDocument';
import { FilePath } from 'components/document-info-panel/FilePath';
import { DocumentRowType } from 'modules/documentSearch/types';
import { MetadataContainer } from 'pages/authorized/search/elements';
import { Highlight } from 'pages/authorized/search/map/cards/document/components/Highlight';
import { Metadata } from 'pages/authorized/search/map/cards/document/components/Metadata';
import { MarginBottomNormalContainer } from 'styles/layout';

export type Props = {
  row: DocumentRowType;
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

      {row.original.doc.truncatedContent && (
        <MarginBottomNormalContainer>
          <Highlight doc={row.original} />
        </MarginBottomNormalContainer>
      )}

      <Metadata doc={row.original} numberOfColumns={4} />
    </MetadataContainer>
  );
};
