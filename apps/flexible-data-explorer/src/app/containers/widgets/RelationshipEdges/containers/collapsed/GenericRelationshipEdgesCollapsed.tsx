import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import capitalize from 'lodash/capitalize';
import empty from 'lodash/isEmpty';
import { matchSorter } from 'match-sorter';

import { Button } from '../../../../../components/buttons/Button';
import { SearchInput } from '../../../../../components/input/SearchInput';
import { SearchResults } from '../../../../../components/search/SearchResults';
import { Widget } from '../../../../../components/widget/Widget';
import { useNavigation } from '../../../../../hooks/useNavigation';
import { useInstanceRelationshipQuery } from '../../../../../services/instances/generic/queries/useInstanceRelationshipQuery';
import { InstancePreview } from '../../../../preview/InstancePreview';
import { RelationshipEdgesProps } from '../../RelationshipEdgesWidget';

export const GenericRelationshipEdgesCollapsed: React.FC<
  RelationshipEdgesProps
> = ({ id, onExpandClick, rows, columns, type }) => {
  const { dataModel, version, space } = useParams();
  const navigate = useNavigation();
  const { data, status, isFetched } = useInstanceRelationshipQuery(type);

  const [query, setQuery] = useState('');

  const isDisabled = isFetched && empty(data?.items);
  const isEmpty = isFetched && data?.items.length === 0;

  const results = useMemo(() => {
    return matchSorter(data?.items || [], query, {
      keys: ['externalId', 'name'],
    });
  }, [data, query]);

  if (!dataModel || !space || !version) {
    console.error('Missing dataModel, space or version in params');
    return null;
  }

  return (
    <Widget rows={rows || 4} columns={columns} id={id}>
      <Widget.Header type={type.type} title={capitalize(id)}>
        {!isEmpty && <SearchInput query={query} onChange={setQuery} />}

        <Button.Fullscreen
          onClick={() => onExpandClick?.(id)}
          disabled={isDisabled}
        />
      </Widget.Header>

      <Widget.Body state={isEmpty ? 'empty' : status} noPadding>
        <SearchResults.Body noShadow>
          {results.map((item) => {
            return (
              <InstancePreview.Generic
                key={item.externalId}
                instance={{
                  instanceSpace: item.space,
                  dataType: type.type,
                  externalId: item.externalId,
                }}
                dataModel={{
                  externalId: dataModel,
                  space,
                  version,
                }}
                disabled={isDisabled}
              >
                <SearchResults.Item
                  key={item.externalId}
                  name={item.name || item.externalId}
                  onClick={() => {
                    navigate.toInstancePage(
                      type.type,
                      item.space,
                      item.externalId,
                      {
                        dataModel,
                        space,
                        version,
                      }
                    );
                  }}
                />
              </InstancePreview.Generic>
            );
          })}
        </SearchResults.Body>
      </Widget.Body>
    </Widget>
  );
};
