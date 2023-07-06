import { useEffect, useState } from 'react';

import styled from 'styled-components';

import {
  sendToCopilotEvent,
  useFromCopilotEventHandler,
} from '@fusion/copilot-core';

import { useDataModelParams } from '../../../hooks/useDataModelParams';
import {
  useSearchFilterParams,
  useSearchQueryParams,
} from '../../../hooks/useParams';

export const AIResults = () => {
  const [query] = useSearchQueryParams();
  const [filters] = useSearchFilterParams();
  const selectedDataModel = useDataModelParams();

  const [data, _setData] = useState([
    { name: 'test', value: 1 },
    { name: 'test2', value: 2 },
  ]);
  const [gqlQuery, setGQLQuery] = useState('');

  useFromCopilotEventHandler('GQL_QUERY', ({ query: newGqlQuery }) => {
    setGQLQuery(newGqlQuery);
  });

  useEffect(() => {
    // TODO on page refresh, should resend this (changes needed copilot side)
    if (query && selectedDataModel) {
      sendToCopilotEvent('NEW_MESSAGES', [
        {
          source: 'bot',
          type: 'data-model',
          ...selectedDataModel,
          content: 'I am looking at data in this data model',
        },
        {
          source: 'user',
          content: `I would like to search for data in my data model: "${query}" with this filter: \`\`\`${JSON.stringify(
            filters
          )} \`\`\``,
          type: 'text',
        },
      ]);
    }
  }, [query, filters, selectedDataModel]);

  if (!gqlQuery) {
    return <></>;
  }

  return (
    <Wrapper>
      <h2>AI Results:</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <pre>query: {gqlQuery}</pre>
    </Wrapper>
  );
};

const Wrapper = styled.div`
  width: 100%;
  height: 400px;
  background: mediumpurple;
  margin-bottom: 50px;
`;
