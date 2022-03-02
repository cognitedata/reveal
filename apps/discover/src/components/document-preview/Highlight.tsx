import React from 'react';
import SanitizedHTML from 'react-sanitized-html';

import first from 'lodash/head';
import styled from 'styled-components/macro';

import { Body } from '@cognite/cogs.js';
import { useTranslation } from '@cognite/react-i18n';

import { PreviewHeader } from 'components/document-preview/elements';
import { Value } from 'components/metadataTable/elements';
import { useDocumentHighlightedContent } from 'hooks/useDocumentHighlightedContent';
import { DocumentType } from 'modules/documentSearch/types';
import { FlexColumn } from 'styles/layout';

const HighlightedBody = styled(SanitizedHTML)`
  em {
    font-weight: 650;
  }
`;

const HighlightView: React.FC<{ content: string }> = React.memo(
  ({ content }) => (
    <Body level={3} as="div">
      <PreviewHeader>Highlight</PreviewHeader>
      <HighlightedBody allowedTags={['em']} html={`${content}...`} />
    </Body>
  )
);

// This component is extended with the logic of either show the first
// sentence highlighted (based on keyword) or showing the first sentence in the document.
export const Highlight: React.FC<{ doc: DocumentType }> = ({ doc }) => {
  const [documentHighlight] = useDocumentHighlightedContent(doc);
  const { t } = useTranslation('Documents');

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
