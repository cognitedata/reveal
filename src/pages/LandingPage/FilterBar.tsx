import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { Input } from '@cognite/cogs.js';
import { Flex, IconButton } from 'components/Common';
import { trackUsage, PNID_METRICS } from 'utils/Metrics';

interface FilterBarProps {
  query: string;
  setQuery: (val: string) => void;
}
export default function FilterBar({ query, setQuery }: FilterBarProps) {
  const { tenant } = useParams<{ tenant: string }>();
  const history = useHistory();

  const onContextualizeNew = () => {
    trackUsage(PNID_METRICS.contextualization.start);
    history.push(`/${tenant}/pnid_parsing_new/files`);
  };

  return (
    <Flex row style={{ margin: '20px 0', justifyContent: 'space-between' }}>
      <Input
        placeholder="Filter by name..."
        onChange={(e) => setQuery(e.currentTarget.value)}
        value={query}
      />
      <IconButton type="primary" icon="Document" onClick={onContextualizeNew}>
        Contextualize a new file
      </IconButton>
    </Flex>
  );
}
