import {
  CSSProperties,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import styled, { css } from 'styled-components';

import { Typography } from '@fdx/components';
import { useClickOutsideListener } from '@fdx/shared/hooks/listeners/useClickOutsideListener';
import { useNavigation } from '@fdx/shared/hooks/useNavigation';
import {
  useAISearchParams,
  useSearchCategoryParams,
  useSearchFilterParams,
  useSearchQueryParams,
} from '@fdx/shared/hooks/useParams';
import { useTranslation } from '@fdx/shared/hooks/useTranslation';
import { useFDM } from '@fdx/shared/providers/FDMProvider';
import zIndex from '@fdx/shared/utils/zIndex';
import { matchSorter } from 'match-sorter';

import { Button, Chip, Tooltip } from '@cognite/cogs.js';

// import { useTranslation } from '@fdx/shared/useTranslation';

import { AISearchPreview } from './AISearchPreview';
import { AISearchCategoryDropdown } from './components/AISearchCategoryDropdown';
import { AiSearchIcon } from './components/AiSearchIcon';
import { SearchBarSwitch } from './SearchBarSwitch';
import { SearchPreview } from './SearchPreview';

interface Props {
  width?: string;
  inverted?: boolean;
  disablePreview?: boolean;
  autoFocus?: boolean;
  options?: {
    filterMenuMaxHeight?: CSSProperties['maxHeight'];
  };
}

export const SearchBar: React.FC<Props> = ({
  width,
  inverted,
  autoFocus,
  disablePreview,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigation();
  const client = useFDM();

  const ref = useRef<HTMLDivElement | null>(null);

  const [isAISearch] = useAISearchParams();
  const [globalQuery] = useSearchQueryParams();
  const [localQuery, setLocalQuery] = useState('');
  const [filters] = useSearchFilterParams();
  const [category, setCategory] = useSearchCategoryParams();
  const [isPreviewFocused, setPreviewFocus] = useState(false);

  const types = useMemo(() => {
    const genericTypes = client.allDataTypes || [];

    // TODO: Fix hardcoded types
    return [
      ...genericTypes,
      { name: 'TimeSeries', displayName: 'Time series' },
      { name: 'File', displayName: 'File' },
    ];
  }, [client]);

  const typesResults = useMemo(() => {
    if (localQuery.length < 3) {
      return [];
    }
    return matchSorter(types, localQuery, {
      keys: ['name', 'displayName'],
    });
  }, [types, localQuery]);

  const closePreview = useCallback(() => {
    setPreviewFocus(false);
  }, []);

  const handleSearchClick = () => {
    closePreview();

    navigate.toSearchPage(localQuery, filters, {
      category,
      enableAISearch: isAISearch,
    });
  };

  useClickOutsideListener(closePreview, ref);

  useEffect(() => {
    // The query in the url have higher precedence than the local query. Make sure that it is synced.
    if (localQuery !== globalQuery) {
      setLocalQuery(globalQuery ?? '');
    }
  }, [globalQuery]);

  return (
    <>
      <Container
        ref={ref}
        focused={!localQuery && !category && isPreviewFocused}
        width={width}
        inverted={isPreviewFocused ? false : inverted}
        $isAIEnabled={isAISearch}
      >
        <Content>
          {isAISearch && <AiSearchIcon />}
          {isAISearch && <AISearchCategoryDropdown />}
          {category && !isAISearch && (
            <CategoryChip
              label={category}
              onRemove={() => {
                setCategory(undefined);
              }}
            />
          )}
          <StyledInput
            data-testid="search-bar"
            onKeyUp={(e) => {
              if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();
                (e.target as any).blur();

                handleSearchClick();
              }
            }}
            // Do not add onBlur to input, it messes with the search preview dropdown.
            // onBlur={() => {})
            onKeyDown={(e) => {
              if (!isAISearch && (e.key === 'Tab' || e.keyCode === 9)) {
                e.preventDefault();
                setCategory(typesResults[0].name);
                setLocalQuery('');
              }
            }}
            onFocus={() => {
              if (!disablePreview) {
                setPreviewFocus(true);
              }
            }}
            value={localQuery ?? ''}
            autoFocus={autoFocus}
            placeholder={t(
              isAISearch ? 'AI_SEARCH_PLACEHOLDER' : 'SEARCH_PLACEHOLDER'
            )}
            onChange={(e) => {
              e.preventDefault();

              setLocalQuery(e.target.value);
            }}
          />
          {!isAISearch && typesResults.length > 0 && (
            <Typography.Body size="xsmall">
              {t('SEARCH_BAR_HINT_TEXT', {
                category:
                  typesResults?.[0]?.displayName || typesResults?.[0].name,
              })}
            </Typography.Body>
          )}
          {/* {!isAISearch && (
            <SearchFilters
              value={filters}
              onClick={() => {
                closePreview();
              }}
              onChange={(newValue) => {
                navigate.toSearchPage(globalQuery, newValue, { category });
              }}
              filterMenuMaxHeight={options?.filterMenuMaxHeight}
            />
          )} */}
          <Tooltip content="Search">
            <Button
              type={isPreviewFocused ? 'primary' : 'secondary'}
              icon="Search"
              aria-label="Search"
              onClick={() => {
                handleSearchClick();
              }}
            />
          </Tooltip>
        </Content>

        {isPreviewFocused && isAISearch && (
          <AISearchPreview query={localQuery} onSelectionClick={closePreview} />
        )}
        {isPreviewFocused && !isAISearch && !category && (
          <SearchPreview query={localQuery} onSelectionClick={closePreview} />
        )}
      </Container>

      {!isAISearch && <SearchBarSwitch inverted={inverted} />}
    </>
  );
};

const Container = styled.div<{
  focused: boolean;
  width?: string;
  inverted?: boolean;
  $isAIEnabled?: boolean;
}>`
  width: 100%;
  flex: 1;
  background-color: white;
  height: 52px;
  margin: 24px;
  margin-left: 0;
  margin-right: 0;
  border-bottom: none;
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
  }};
`;

const Content = styled.div`
  display: flex;
  align-items: center;
  padding: 0 10px;
  padding-left: 16px;
  gap: 8px;
`;

const StyledInput = styled.input.attrs({ type: 'search' })`
  flex: 1;
  background: transparent;
  border-radius: inherit;
  border: none;
  min-height: 52px;

  &:focus {
    outline: none;
  }
`;

const CategoryChip = styled(Chip).attrs({ type: 'neutral', size: 'small' })`
  min-width: unset;
  max-width: unset;
`;