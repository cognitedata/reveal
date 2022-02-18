import {
  Wrapper,
  MainTitle,
  MainDescription,
  GroupTitle,
  Group,
} from '@platypus-app/components/Styles/storybook';
import configureStory from '@platypus-app/tests/configureStorybook';
import { createGraphiQLFetcher } from '@graphiql/toolkit';

import { FETCHER_API, DEFAULT_QUERY } from './query-explorer.mock';
import { QueryExplorer } from './QueryExplorer';
import graphQlQueryFetcher from '../utils/graphqlQueryFetcher';

const mockFetcher = createGraphiQLFetcher({
  url: FETCHER_API,
});

export default {
  title: 'Schema/QueryExplorer',
  component: QueryExplorer,
};

export const Base = () => (
  <Wrapper>
    <MainTitle>
      Query explorer (based on{' '}
      <a
        href="https://www.npmjs.com/package/graphiql"
        target="_blank"
        rel="noreferrer"
      >
        GraphiQL
      </a>
      )
    </MainTitle>
    <MainDescription title="Where is it used?">
      This component is used on Solution/Data Model/Query Explorer page.
    </MainDescription>
    <Group>
      <GroupTitle>Default</GroupTitle>
      <div style={{ height: '600px' }}>
        <QueryExplorer
          solutionId="1"
          schemaVersion="1"
          defaultQuery={DEFAULT_QUERY}
        />
      </div>
    </Group>
  </Wrapper>
);

Base.story = configureStory({
  // eslint-disable-next-line
  setupMocks: (sandbox: any) => {
    sandbox.stub(graphQlQueryFetcher, 'fetcher').callsFake(mockFetcher);
    return sandbox;
  },
});
