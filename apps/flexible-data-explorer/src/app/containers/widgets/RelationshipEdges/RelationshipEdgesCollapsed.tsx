import { useParams } from 'react-router-dom';

import isEmpty from 'lodash/isEmpty';

import { Button } from '../../../components/buttons/Button';
import { SearchResults } from '../../../components/search/SearchResults';
import { Widget } from '../../../components/widget/Widget';
import { useNavigation } from '../../../hooks/useNavigation';
import { useTranslation } from '../../../hooks/useTranslation';
import { useInstanceRelationshipQuery } from '../../../services/instances/generic/queries/useInstanceRelationshipQuery';
import { InstancePreview } from '../../preview/InstancePreview';

import { RelationshipEdgesProps } from './RelationshipEdgesWidget';

export const RelationshipEdgesCollapsed: React.FC<RelationshipEdgesProps> = ({
  id,
  onExpandClick,
  rows,
  columns,
  type,
}) => {
  const { t } = useTranslation();
  const { dataModel, version, space } = useParams();
  const navigate = useNavigation();
  const { data, isLoading, status, isFetched } =
    useInstanceRelationshipQuery(type);

  const isDisabled = isFetched && isEmpty(data);

  if (!dataModel || !space || !version) {
    console.error('Missing dataModel, space or version in params');
    return null;
  }

  return (
    <Widget rows={rows || 4} columns={columns} id={id}>
      <Widget.Header title={t('RELATIONSHIP_EDGES_WIDGET_TITLE', { type: id })}>
        <Button.Fullscreen
          onClick={() => onExpandClick?.(id)}
          disabled={isDisabled}
        />
      </Widget.Header>

      <Widget.Body
        state={!isLoading && data.length === 0 ? 'empty' : status}
        noPadding
      >
        <SearchResults.Body noShadow>
          {data.map((item) => {
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
