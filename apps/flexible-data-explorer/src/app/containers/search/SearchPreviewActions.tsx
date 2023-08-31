import { useCallback, useMemo, useReducer } from 'react';
import { useParams } from 'react-router-dom';

import { matchSorter } from 'match-sorter';

import { useKeyboardListener } from '../../hooks/listeners/useKeyboardListener';
import { useNavigation } from '../../hooks/useNavigation';
import { useSearchFilterParams } from '../../hooks/useParams';
import { useTranslation } from '../../hooks/useTranslation';
import { useFDM } from '../../providers/FDMProvider';

import { SearchList } from './components/SearchList';

enum SearchActions {
  SEARCH_IN_TYPE = -3,
  SEARCH_IN_ALL = -2,
  SEARCH_IN_AI = -1,
}

// NOTE: Component currently not in use. Leaving the code as is for now.
export const SearchPreviewActions = ({
  query,
  onSelectionClick,
}: {
  query: string;
  onSelectionClick?: () => void;
}) => {
  const { t } = useTranslation();
  const { type } = useParams();
  const navigate = useNavigation();
  const [filterParams] = useSearchFilterParams();

  const client = useFDM();

  const types = useMemo(() => {
    const genericTypes = (client.allDataTypes || []).map(({ name }) => name);

    // TODO: Fix hardcoded types
    return [...genericTypes, 'TimeSeries', 'File'];
  }, [client]);

  const typesResults = useMemo(
    () =>
      matchSorter(types, query, {
        threshold: matchSorter.rankings.STARTS_WITH,
      }),
    [types, query]
  );

  // In cases you are within a specific category, show the options of both:
  // Search for "query" in "type", and
  // Search for "query"
  const defaultSearchActionValue = type
    ? SearchActions.SEARCH_IN_TYPE
    : SearchActions.SEARCH_IN_ALL;

  const [active, setAction] = useReducer(
    (prev: number, next: 'UP' | 'DOWN') => {
      const value = next === 'UP' ? -1 : 1;
      const count = prev + value;

      if (count <= defaultSearchActionValue) {
        return defaultSearchActionValue;
      }

      if (count >= typesResults.length) {
        return typesResults.length - 1;
      }

      return count;
    },
    defaultSearchActionValue
  );

  const handleKeyListener = useCallback(
    (code: string) => {
      if (code === 'ArrowUp') {
        setAction('UP');
      }

      if (code === 'ArrowDown') {
        setAction('DOWN');
      }

      if (code === 'Enter') {
        onSelectionClick?.();

        if (active === SearchActions.SEARCH_IN_TYPE) {
          navigate.toSearchPage(query, filterParams);
        } else if (active === SearchActions.SEARCH_IN_ALL) {
          navigate.toSearchPage(query, filterParams, {
            ignoreType: true,
          });
        } else {
          // navigate.toSearchCategoryPage(typesResults[active], true);
        }
      }
    },
    [active, navigate, query, filterParams, typesResults, onSelectionClick]
  );
  useKeyboardListener(handleKeyListener);

  return (
    <SearchList>
      {type && (
        <SearchList.Item
          focused={active === SearchActions.SEARCH_IN_TYPE}
          title={t('SEARCH_BAR_SEARCH_FOR_IN_TYPE', { query, type })}
          icon="ListSearch"
          onClick={() => {
            navigate.toSearchPage(query, filterParams);
            onSelectionClick?.();
          }}
        />
      )}
      <SearchList.Item
        focused={active === SearchActions.SEARCH_IN_ALL}
        title={t('SEARCH_BAR_SEARCH_FOR', { query })}
        icon="Search"
        onClick={() => {
          navigate.toSearchPage(query, filterParams, {
            ignoreType: true,
          });
          onSelectionClick?.();
        }}
      />

      {typesResults.map((item, index) => (
        <SearchList.Item
          key={index}
          title={t('SEARCH_BAR_LIST_ALL', { type: item })}
          icon="List"
          focused={active === index}
          onClick={() => {
            // navigate.toSearchCategoryPage(item, true);
            onSelectionClick?.();
          }}
        />
      ))}
    </SearchList>
  );
};
