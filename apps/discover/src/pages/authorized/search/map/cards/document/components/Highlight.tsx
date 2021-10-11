import React from 'react';
import SanitizedHTML from 'react-sanitized-html';

import first from 'lodash/head';
import styled from 'styled-components/macro';

import { Body } from '@cognite/cogs.js';
import { useTranslation } from '@cognite/react-i18n';

import { PreviewHeader } from 'components/document-info-panel/elements';
import { Value } from 'components/metadataTable/elements';
import { useDocumentHighlightedContent } from 'hooks/useDocumentHighlightedContent';
import { DocumentType } from 'modules/documentSearch/types';
import { FlexColumn } from 'styles/layout';

const HighlightedBody = styled(SanitizedHTML)`
  em {
    font-weight: 650;
  }
  margin-top: 15px;
`;

// This component is extended with the logic of either show the first
// sentence highlighted (based on keyword) or showing the first sentence in the document.
export const Highlight: React.FC<{ doc: DocumentType }> = ({ doc }) => {
  const [documentHighlight] = useDocumentHighlightedContent(doc);
  const { t } = useTranslation('Documents');

  const Wrapper: React.FC = ({ children }) => (
    <Body level={3} as="div">
      {children}
    </Body>
  );

  const HighlightView: React.FC<{ content: string }> = ({ content }) => (
    <Wrapper>
      <HighlightedBody allowedTags={['em']} html={`${content}...`} />
    </Wrapper>
  );

  const hasSentenceToHighlight = first(documentHighlight?.content);

  if (hasSentenceToHighlight) {
    return <HighlightView content={hasSentenceToHighlight} />;
  }

  return (
    <FlexColumn>
      {doc.doc.truncatedContent && (
        <>
          <PreviewHeader>{t('Preview')}</PreviewHeader>
          <Value>{`${doc.doc.truncatedContent}...`}</Value>
        </>
      )}
    </FlexColumn>
  );
};

export default Highlight;
