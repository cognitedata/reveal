import { Tooltip, Label } from '@cognite/cogs.js';

import { DocumentNameSpan, DocumentNameWrapper } from './elements';

type DocumentNameProps = {
  documentName?: string;
};

const DocumentName = ({ documentName }: DocumentNameProps) => {
  return (
    <DocumentNameWrapper>
      <Tooltip content={documentName}>
        <Label
          icon="Document"
          size="small"
          onClick={() => {
            window.navigator.clipboard.writeText(documentName || '');
          }}
        >
          <DocumentNameSpan>{documentName}</DocumentNameSpan>
        </Label>
      </Tooltip>
    </DocumentNameWrapper>
  );
};

export default DocumentName;
