import { useParams } from 'react-router-dom';

import { Button, Widget } from '@fdx/components';
import { useInstanceDirectRelationshipQuery } from '@fdx/services/instances/generic/queries/useInstanceDirectRelationshipQuery';
import { DASH } from '@fdx/shared/constants/common';
import { useNavigation } from '@fdx/shared/hooks/useNavigation';
import { capitalize } from 'lodash';

import { Icon } from '@cognite/cogs.js';

import { InstancePreview } from '../../../preview/InstancePreview';
import { RelationshipDirectProps } from '../RelationshipDirect';

export const GenericRelationshipDirect: React.FC<RelationshipDirectProps> = ({
  id,
  rows,
  columns,
  type,
}) => {
  const { dataModel, space, version } = useParams();
  const navigate = useNavigation();

  const { data, isLoading, isFetched, isError } =
    useInstanceDirectRelationshipQuery(type);

  const handleRedirectClick = () => {
    navigate.toInstancePage(type.type, data.space, data.externalId, {
      dataModel,
      space,
      version,
    });
  };

  const isDisabled = (isFetched && data === null) || isError;

  const renderValueTitle = () => {
    if (isLoading) {
      return <Icon type="Loader" />;
    }

    return data?.name || data?.externalId || DASH;
  };

  if (!dataModel || !space || !version) {
    console.error('Missing dataModel, space or version in params');
    return null;
  }

  return (
    <Widget id={id} rows={rows} columns={columns}>
      <Widget.Header
        type={type.type}
        header={capitalize(type.field)}
        title={renderValueTitle()}
      >
        <InstancePreview.Generic
          instance={{
            instanceSpace: data?.space,
            dataType: type.type,
            externalId: data?.externalId,
          }}
          dataModel={{
            externalId: dataModel,
            space,
            version,
          }}
          disabled={isDisabled}
        >
          <Button.InternalRedirect
            onClick={() => {
              handleRedirectClick();
            }}
            disabled={isLoading || isDisabled}
          />
        </InstancePreview.Generic>
      </Widget.Header>
    </Widget>
  );
};
