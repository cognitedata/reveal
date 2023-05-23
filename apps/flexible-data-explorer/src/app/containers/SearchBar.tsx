import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import styled from 'styled-components';
import { useNavigation } from '../hooks/useNavigation';
import { useTranslation } from '../hooks/useTranslation';

export const SearchBar = () => {
  const { t } = useTranslation();

  const navigate = useNavigation();
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get('searchQuery');

  const [query, setQuery] = useState('');
  const [isFocused, setFocus] = useState(false);

  useEffect(() => {
    if (query !== searchQuery) {
      setQuery(searchQuery ?? '');
    }
  }, [searchQuery]);

  return (
    <>
      <InputContent
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        focused={isFocused}
      >
        <StyledInput
          onKeyUp={(e) => {
            if (e.key === 'Enter' || e.keyCode === 13) {
              navigate.toSearchPage(query);
            }
          }}
          value={query ?? ''}
          // icon="Search"
          placeholder={t('search_button', 'Search...')}
          onChange={(e) => {
            e.preventDefault();

            setQuery(e.target.value);
          }}
        />
        {/* {isFocused && <Container>Hi</Container>} */}
      </InputContent>
    </>
  );
};

const InputContent = styled.div<{ focused: boolean }>`
  width: 80%;
  background-color: white;
  height: 52px;
  border-radius: 64px;

  margin: 24px;

  padding: 0 8px;
  /* position: relative; */
  border: 1px solid rgba(210, 212, 218, 0.56);

  /* outline: ${(props) => (props.focused ? '1px solid red' : 'none')}; */
`;

const StyledInput = styled.input.attrs({ type: 'search' })`
  width: 100%;
  background: transparent;
  border-radius: inherit;
  border: none;
  min-height: 52px;

  &:focus {
    outline: none;
  }
`;
