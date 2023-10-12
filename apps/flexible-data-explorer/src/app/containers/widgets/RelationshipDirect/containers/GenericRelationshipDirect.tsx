import { useParams } from 'react-router-dom';

import { capitalize } from 'lodash';

import { Icon } from '@cognite/cogs.js';

import { Button } from '../../../../components/buttons/Button';
import { Widget } from '../../../../components/widget/Widget';
import { DASH } from '../../../../constants/common';
import { useNavigation } from '../../../../hooks/useNavigation';
import { useInstanceDirectRelationshipQuery } from '../../../../services/instances/generic/queries/useInstanceDirectRelationshipQuery';
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
