import { Button, Widget } from '@fdx/components';
import { useInstanceDirectRelationshipQuery } from '@fdx/services/instances/generic/queries/useInstanceDirectRelationshipQuery';
import { DASH } from '@fdx/shared/constants/common';
import { useNavigation } from '@fdx/shared/hooks/useNavigation';
import { capitalize } from 'lodash';

import { Icon } from '@cognite/cogs.js';

import { InstancePreview } from '../../../preview/InstancePreview';
import { RelationshipDirectProps } from '../RelationshipDirect';

export const FileRelationshipDirect: React.FC<RelationshipDirectProps> = ({
  id,
  rows,
  columns,
  type,
}) => {
  const navigate = useNavigation();

  const { data, isLoading, isFetched, isError } =
    useInstanceDirectRelationshipQuery<{
      externalId: string;
    } | null>(type);

  const handleRedirectClick = () => {
    if (!data?.externalId) {
      return;
    }

    navigate.toFilePage(data?.externalId);
  };

  const isDisabled = (isFetched && !data) || isError;

  const renderValueTitle = () => {
    if (isLoading) {
      return <Icon type="Loader" />;
    }

    return data?.externalId || DASH;
  };

  return (
    <Widget id={id} rows={rows} columns={columns}>
      <Widget.Header
        type="File"
        header={capitalize(type.field)}
        title={renderValueTitle()}
      >
        <InstancePreview.File
          id={data?.externalId as any}
          disabled={isDisabled}
        >
          <Button.InternalRedirect
            onClick={() => {
              handleRedirectClick();
            }}
            disabled={isLoading || isDisabled}
          />
        </InstancePreview.File>
      </Widget.Header>
    </Widget>
  );
};
