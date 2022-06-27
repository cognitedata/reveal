import { Title, Flex, Body } from '@cognite/cogs.js';
import styled from 'styled-components';

import { useResult } from '../../../hooks/useResult';
import { DocumentPreview } from '../../../components/DocumentPreview/DocumentPreview';
import { ResultType } from '../types';

type Props = {
  result?: ResultType;
};

const PreviewContainer = styled(Flex)`
  justify-content: center;
  align-items: center;
`;
export const Result = ({ result }: Props) => {
  if (!result) {
    return null;
  }
  const { documentId, resultString } = useResult(result);

  return (
    <Flex direction="column">
      <Title level={2}>Result</Title>
      {documentId && (
        <PreviewContainer>
          <DocumentPreview documentId={Number(documentId)} />
        </PreviewContainer>
      )}
      {resultString && <Body style={{ margin: '2rem' }}>{resultString}</Body>}
    </Flex>
  );
};
