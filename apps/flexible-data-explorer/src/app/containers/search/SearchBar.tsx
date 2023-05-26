import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import styled from 'styled-components';

import { Icon } from '@cognite/cogs.js';

import { useClickOutsideListener } from '../../hooks/listeners/useClickOutsideListener';
import { useNavigation } from '../../hooks/useNavigation';
import { useTranslation } from '../../hooks/useTranslation';
import zIndex from '../../utils/zIndex';

import { SearchFilters } from './SearchFilters';
import { SearchPreview } from './SearchPreview';

interface Props {
  width?: string;
  inverted?: boolean;
}

export const SearchBar: React.FC<Props> = ({ width, inverted }) => {
  const { t } = useTranslation();

  const ref = useRef<HTMLDivElement | null>(null);

  const navigate = useNavigation();
  const [searchParams] = useSearchParams();

  const searchQuery = searchParams.get('searchQuery');

  const [query, setQuery] = useState('');
  const [isFocused, setFocus] = useState(false);

  const closePreview = useCallback(() => {
    setFocus(false);
  }, []);

  useEffect(() => {
    if (query !== searchQuery) {
      setQuery(searchQuery ?? '');
    }
  }, [searchQuery]);

  useClickOutsideListener(closePreview, ref);

  return (
    <Container
      ref={ref}
      onFocus={() => {
        setFocus(true);
      }}
      focused={isFocused}
      width={width}
      inverted={inverted}
    >
      <Content>
        <StyledIcon type="Search" />
        <StyledInput
          onKeyUp={(e) => {
            if (e.key === 'Enter' || e.keyCode === 13) {
              closePreview();
              navigate.toSearchPage(query);
            }
          }}
          value={query ?? ''}
          placeholder={t('search_button', 'Search...')}
          onChange={(e) => {
            e.preventDefault();

            setQuery(e.target.value);
          }}
        />

        <SearchFilters />
      </Content>

      {isFocused && <SearchPreview />}
    </Container>
  );
};

const Container = styled.div<{
  focused: boolean;
  width?: string;
  inverted?: boolean;
}>`
  width: ${(props) => props.width ?? '100%'};
  background-color: white;
  height: 52px;
  margin: 24px;
  border-bottom: none;
  border-bottom-left: none;
  z-index: ${zIndex.SEARCH};

  filter: drop-shadow(0px 1px 8px rgba(79, 82, 104, 0.06))
    drop-shadow(0px 1px 1px rgba(79, 82, 104, 0.1));

  ${(props) => {
    if (props.inverted) {
      return `
        background-color: #F3F4F8;
        outline: 1px solid rgba(210, 212, 218, 0.56);
      `;
    }
  }};

  ${(props) => {
    if (props.focused) {
      return `
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        background-color: white;
        outline: none;
      `;
    }

    return `
      border-radius: 10px;
    `;
  }}
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px;
  padding-left: 16px;
  gap: 8px;
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

const StyledIcon = styled(Icon)`
  min-width: 16px;
`;
