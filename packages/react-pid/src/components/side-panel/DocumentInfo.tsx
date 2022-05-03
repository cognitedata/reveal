import {
  DocumentMetadata,
  isIso,
  isPid,
  DiagramType,
} from '@cognite/pid-tools';
import styled from 'styled-components';
import { Row, Title } from '@cognite/cogs.js';

import { CollapseSeperator } from './CollapsableInstanceList';

const multiColName = 'col-3';

const MetaData = styled.div`
  padding: 0.5rem 1rem;
  border-bottom: 1px solid var(--cogs-greyscale-grey3);
  .${multiColName} {
    grid-template-columns: 2fr 1fr 1fr !important;
    margin-top: 0.5rem;
  }
  .cogs-row {
    gap: 2px !important;
    justify-items: start;
  }
`;

export interface DocumentInfoProps {
  documentMetadata: DocumentMetadata;
}

export const DocumentInfo: React.FC<DocumentInfoProps> = ({
  documentMetadata,
}) => {
  if (documentMetadata.type !== DiagramType.unknown) {
    return (
      <div>
        <CollapseSeperator>Document info</CollapseSeperator>
        <MetaData>
          <Row cols={1}>
            <Title level={6}>Name</Title>
            <span>{documentMetadata.name}</span>
          </Row>
          <Row cols={3} className={multiColName}>
            <Row cols={1}>
              <Title level={6}>Document type</Title>
              {documentMetadata.type}
            </Row>
            <Row cols={1}>
              <Title level={6}>Unit</Title>
              {documentMetadata.unit}
            </Row>
            <Row cols={1}>
              <Title level={6}>#</Title>
              {isIso(documentMetadata) &&
                `${documentMetadata.lineNumber}-${documentMetadata.pageNumber}`}
              {isPid(documentMetadata) && documentMetadata.documentNumber}
            </Row>
          </Row>
        </MetaData>
      </div>
    );
  }
  return <span />;
};
