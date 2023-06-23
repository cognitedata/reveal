import { useParams } from 'react-router-dom';

import { Button } from '../../../components/buttons/Button';
import { SearchResults } from '../../../components/search/SearchResults';
import { Widget } from '../../../components/widget/Widget';
import { useNavigation } from '../../../hooks/useNavigation';
import { useInstanceRelationshipQuery } from '../../../services/instances/generic/queries/useInstanceRelationshipQuery';

import { RelationshipEdgesProps } from './RelationshipEdgesWidget';

export const RelationshipEdgesCollapsed: React.FC<RelationshipEdgesProps> = ({
  id,
  onExpandClick,
  rows,
  columns,
  type,
}) => {
  const { instanceSpace } = useParams();
  const navigate = useNavigation();
  const { data, isLoading, status } = useInstanceRelationshipQuery(type);

  return (
    <Widget rows={rows || 4} columns={columns} id={id}>
      <Widget.Header title={`Related ${id}`}>
        <Button.Fullscreen
          onClick={() => onExpandClick?.(id)}
          loading={isLoading}
          disabled={!isLoading && data.length === 0}
        />
      </Widget.Header>

      <Widget.Body
        state={!isLoading && data.length === 0 ? 'empty' : status}
        noPadding
      >
        <SearchResults.Body noShadow>
          {data.map((item) => {
            return (
              <SearchResults.Item
                key={item.externalId}
                name={item.name || item.externalId}
                onClick={() => {
                  navigate.toInstancePage(
                    type.type,
                    instanceSpace,
                    item.externalId
                  );
                }}
              />
            );
          })}
        </SearchResults.Body>
      </Widget.Body>
    </Widget>
  );
};
