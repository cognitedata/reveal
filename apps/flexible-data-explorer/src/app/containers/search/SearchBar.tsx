import { useCallback, useEffect, useRef, useState } from 'react';

import styled, { css } from 'styled-components';

import { Icon } from '@cognite/cogs.js';

import { useClickOutsideListener } from '../../hooks/listeners/useClickOutsideListener';
import { useNavigation } from '../../hooks/useNavigation';
import {
  useSearchFilterParams,
  useSearchQueryParams,
} from '../../hooks/useParams';
// import { useTranslation } from '../../hooks/useTranslation';
import zIndex from '../../utils/zIndex';

import { SearchFilters } from './SearchFilters';
import { SearchPreview } from './SearchPreview';

interface Props {
  width?: string;
  inverted?: boolean;
  disablePreview?: boolean;
  autoFocus?: boolean;
}

export const SearchBar: React.FC<Props> = ({
  width,
  inverted,
  autoFocus,
  disablePreview,
}) => {
  // const { t } = useTranslation();
  const navigate = useNavigation();

  const ref = useRef<HTMLDivElement | null>(null);

  const [queryParams] = useSearchQueryParams();
  const [localQuery, setLocalQuery] = useState('');
  const [filterParams] = useSearchFilterParams();
  const [isPreviewFocused, setPreviewFocus] = useState(false);

  const closePreview = useCallback(() => {
    setPreviewFocus(false);
  }, []);

  useClickOutsideListener(closePreview, ref);

  useEffect(() => {
    // The query in the url have higher precedence than the local query. Make sure that it is synced.
    if (localQuery !== queryParams) {
      setLocalQuery(queryParams ?? '');
    }
  }, [queryParams]);

  return (
    <Container
      ref={ref}
      focused={isPreviewFocused}
      width={width}
      inverted={inverted}
    >
      <Content>
        <StyledIcon type="Search" />
        <StyledInput
          onKeyUp={(e) => {
            if (e.key === 'Enter' || e.keyCode === 13) {
              e.preventDefault();
              (e.target as any).blur();

              closePreview();
              navigate.toSearchPage(localQuery, filterParams);
            }
          }}
          onBlur={() => {
            if (!disablePreview) {
              closePreview();
            }
          }}
          onFocus={() => {
            if (!disablePreview) {
              setPreviewFocus(true);
            }
          }}
          value={localQuery ?? ''}
          autoFocus={autoFocus}
          placeholder="Search..."
          onChange={(e) => {
            e.preventDefault();

            setLocalQuery(e.target.value);
          }}
        />

        <SearchFilters
          value={filterParams}
          onChange={(newValue) => {
            navigate.toSearchPage(queryParams, newValue);
          }}
        />
      </Content>

      {isPreviewFocused && <SearchPreview onSelectionClick={closePreview} />}
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

  ${(props) => {
    if (props.inverted) {
      return css`
        background-color: #f3f4f8;
        outline: 1px solid rgba(210, 212, 218, 0.56);
      `;
    }

    return css`
      filter: drop-shadow(0px 1px 8px rgba(79, 82, 104, 0.06))
        drop-shadow(0px 1px 1px rgba(79, 82, 104, 0.1));
    `;
  }};

  ${(props) => {
    if (props.focused) {
      return css`
        border-top-left-radius: 10px;
        border-top-right-radius: 10px;
        background-color: white;
        outline: none;
        filter: drop-shadow(0px 1px 8px rgba(79, 82, 104, 0.06))
          drop-shadow(0px 1px 1px rgba(79, 82, 104, 0.1));
      `;
    }

    return css`
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
