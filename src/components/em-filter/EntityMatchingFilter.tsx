import styled from 'styled-components';
import { Input } from '@cognite/cogs.js';

type EMFilterProps = {
  query: string;
  setQuery: (value: string) => void;
};
const EntityMatchingFilter = ({ query, setQuery }: EMFilterProps) => {
  return (
    <StyledInput
      placeholder="Filter by name..."
      onChange={(e) => setQuery(e.currentTarget.value)}
      value={query}
    />
  );
};

const StyledInput = styled(Input)`
  width: 200px;
  margin: 1rem 0;
`;
export default EntityMatchingFilter;
