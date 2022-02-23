import { FileInfo } from '@cognite/sdk';

import DocumentPreview from '../DocumentPreview';

import { DocumentRowWrapper } from './elements';

export type DocumentRowProps = {
  document: FileInfo;
  descriptionField?: string;
  onClick?: () => void;
};

const DocumentRow = ({
  document,
  descriptionField,
  onClick,
}: DocumentRowProps) => {
  return (
    <DocumentRowWrapper onClick={onClick} className="row">
      <section className="document-row--image">
        <DocumentPreview document={document} />
      </section>
      <section className="document-row--meta">
        <h4>{document.name}</h4>
        <div>{document.metadata?.[descriptionField || '']}</div>
      </section>
    </DocumentRowWrapper>
  );
};

export default DocumentRow;
