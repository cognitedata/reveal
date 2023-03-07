import styled from 'styled-components';
import { Input } from '@cognite/cogs.js';
import { useTranslation } from 'common/i18n';
import { SOURCE_TABLE_QUERY_KEY } from '../../constants';
import { NavigateOptions, URLSearchParamsInit } from 'react-router-dom';

declare type SetURLSearchParams = (
  nextInit?:
    | URLSearchParamsInit
    | ((prev: URLSearchParams) => URLSearchParamsInit),
  navigateOpts?: NavigateOptions
) => void;

type EMFilterProps = {
  searchParams: URLSearchParams;
  setSearchParams: SetURLSearchParams;
};
const EntityMatchingFilter = ({
  searchParams,
  setSearchParams,
}: EMFilterProps) => {
  const { t } = useTranslation();
  return (
    <StyledInput
      placeholder={t('filter-placeholder')}
      onChange={(e) => {
        searchParams.set(SOURCE_TABLE_QUERY_KEY, e.target.value);
        setSearchParams(searchParams);
      }}
      value={searchParams.get(SOURCE_TABLE_QUERY_KEY) || ''}
    />
  );
};

const StyledInput = styled(Input)`
  width: 200px;
  margin: 1rem 0;
`;
export default EntityMatchingFilter;
