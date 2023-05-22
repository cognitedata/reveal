import { Page } from '../containers/page/Page';
import { useNavigation } from '../hooks/useNavigation';
import { useSearchDataTypesQuery } from '../services/dataTypes/queries/useSearchDataTypesQuery';
import { SearchResults } from '../components/search/SearchResults';

export const SearchPage = () => {
  const navigate = useNavigation();

  const { data, isLoading } = useSearchDataTypesQuery();

  return (
    <Page>
      <Page.Body loading={isLoading}>
        {Object.keys(data || {}).map((key) => {
          const values = data?.[key];

          return (
            <SearchResults>
              <SearchResults.Header title={key} />
              <ul>
                {values.items.map((item: any) => (
                  <li
                    onClick={() => {
                      navigate.toInstancePage(key, item.space, item.externalId);
                    }}
                  >
                    {JSON.stringify(item)}
                  </li>
                ))}
              </ul>
            </SearchResults>
          );
        })}
      </Page.Body>
    </Page>
  );
};
