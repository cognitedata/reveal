import styled from 'styled-components';
import { Input } from '@cognite/cogs.js';
import { useTranslation } from 'common/i18n';

type EMFilterProps = {
  query: string;
  setQuery: (value: string) => void;
};
const EntityMatchingFilter = ({ query, setQuery }: EMFilterProps) => {
  const { t } = useTranslation();
  return (
    <StyledInput
      placeholder={t('filter-placeholder')}
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
