import { CSSProperties, useCallback, useEffect, useRef, useState } from 'react';

import styled, { css } from 'styled-components';

import { Icon } from '@cognite/cogs.js';

import { useClickOutsideListener } from '../../hooks/listeners/useClickOutsideListener';
import { useNavigation } from '../../hooks/useNavigation';
import {
  useAISearchParams,
  useSearchFilterParams,
  useSearchQueryParams,
} from '../../hooks/useParams';
// import { useTranslation } from '../../hooks/useTranslation';
import { useTranslation } from '../../hooks/useTranslation';
import zIndex from '../../utils/zIndex';

import { AISearchPreview } from './AISearchPreview';
import { AISearchCategoryDropdown } from './components/AISearchCategoryDropdown';
import { AiSearchIcon } from './components/AiSearchIcon';
import { SearchBarSwitch } from './SearchBarSwitch';
import { SearchFilters } from './SearchFilters';
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
  options,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigation();

  const ref = useRef<HTMLDivElement | null>(null);

  const [globalQuery] = useSearchQueryParams();
  const [localQuery, setLocalQuery] = useState('');
  const [filters] = useSearchFilterParams();
  const [isPreviewFocused, setPreviewFocus] = useState(false);

  const [isAIEnabled] = useAISearchParams();

  const closePreview = useCallback(() => {
    setPreviewFocus(false);
  }, []);

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
        focused={
          isAIEnabled ? !localQuery && isPreviewFocused : isPreviewFocused
        }
        width={width}
        inverted={inverted}
        $isAIEnabled={isAIEnabled}
      >
        <Content>
          {isAIEnabled ? <AiSearchIcon /> : <StyledIcon type="Search" />}
          {isAIEnabled && <AISearchCategoryDropdown />}
          <StyledInput
            onKeyUp={(e) => {
              if (e.key === 'Enter' || e.keyCode === 13) {
                e.preventDefault();
                (e.target as any).blur();

                // Rest of the search logic is handled inside @{SearchPreviewActions}
                if (!localQuery) {
                  closePreview();

                  navigate.toSearchPage(localQuery, filters);
                }
              }
            }}
            // Do not add onBlur to input, it messes with the search preview.
            // onBlur={() => {
            //   if (!disablePreview) {
            //     closePreview();
            //   }
            // }}
            onFocus={() => {
              if (!disablePreview) {
                setPreviewFocus(true);
              }
            }}
            value={localQuery ?? ''}
            autoFocus={autoFocus}
            placeholder={t(
              isAIEnabled ? 'AI_SEARCH_PLACEHOLDER' : 'SEARCH_PLACEHOLDER'
            )}
            onChange={(e) => {
              e.preventDefault();

              setLocalQuery(e.target.value);
            }}
          />

          {!isAIEnabled && (
            <SearchFilters
              value={filters}
              onClick={() => {
                closePreview();
              }}
              onChange={(newValue) => {
                navigate.toSearchPage(globalQuery, newValue);
              }}
              filterMenuMaxHeight={options?.filterMenuMaxHeight}
            />
          )}
        </Content>

        {isPreviewFocused &&
          (isAIEnabled ? (
            <AISearchPreview
              query={localQuery}
              onSelectionClick={closePreview}
            />
          ) : (
            <SearchPreview query={localQuery} onSelectionClick={closePreview} />
          ))}
      </Container>

      {!isAIEnabled && <SearchBarSwitch inverted={inverted} />}
    </>
  );
};

const Container = styled.div<{
  focused: boolean;
  width?: string;
  inverted?: boolean;
  $isAIEnabled?: boolean;
}>`
  width: ${(props) => props.width ?? '100%'};
  background-color: white;
  height: 52px;
  margin: 24px;
  margin-left: 0;
  margin-right: 0;
  border-bottom: none;
  /* border-bottom-left: none; */
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
  flex: 1;
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
