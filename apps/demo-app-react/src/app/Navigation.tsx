import styled from 'styled-components/macro';
import { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Tabs } from '@cognite/cogs.js';

type TabKeys = '' | 'home' | 'data-grid' | 'graph';

export const Navigation = () => {
  const [page, setPage] = useState<TabKeys>('');
  const history = useHistory();

  useEffect(() => {
    if (page) {
      history.push(`/${page}`);
    }
  }, [history, page]);

  return (
    <StyledTabs size="default" onChange={(key) => setPage(key as TabKeys)}>
      <Tabs.TabPane key="home" tab="Home" />
      <Tabs.TabPane key="data-grid" tab="Table" />
      <Tabs.TabPane key="graph" tab="Graph" />
    </StyledTabs>
  );
};

const StyledTabs = styled(Tabs)`
  padding: 0 0 2px 0;
`;
