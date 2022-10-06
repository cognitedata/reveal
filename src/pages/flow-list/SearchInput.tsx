import { Input } from '@cognite/cogs.js';
import { useTranslation } from 'common';
import styled from 'styled-components';

export default function SearchInput() {
  const { t } = useTranslation();
  return (
    <StyledInput
      type="search"
      icon="Search"
      placeholder={t('list-search-placeholder')}
    />
  );
}

const StyledInput = styled(Input)`
  width: 220px;
`;
