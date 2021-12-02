import {
  Wrapper,
  MainTitle,
  MainDescription,
  GroupTitle,
  Group,
} from '@platypus-app/components/Styles/storybook';

import { FETCHER_API, DEFAULT_QUERY } from './query-explorer.mock';
import { QueryExplorer } from './QueryExplorer';

export default {
  title: 'Platypus / QueryExplorer',
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
        <QueryExplorer apiUrl={FETCHER_API} defaultQuery={DEFAULT_QUERY} />
      </div>
    </Group>
  </Wrapper>
);
