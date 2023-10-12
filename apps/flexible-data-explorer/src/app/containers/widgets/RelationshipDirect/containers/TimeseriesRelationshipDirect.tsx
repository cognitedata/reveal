import { capitalize } from 'lodash';

import { Icon } from '@cognite/cogs.js';

import { Button } from '../../../../components/buttons/Button';
import { Widget } from '../../../../components/widget/Widget';
import { DASH } from '../../../../constants/common';
import { useNavigation } from '../../../../hooks/useNavigation';
import { useInstanceDirectRelationshipQuery } from '../../../../services/instances/generic/queries/useInstanceDirectRelationshipQuery';
import { InstancePreview } from '../../../preview/InstancePreview';
import { RelationshipDirectProps } from '../RelationshipDirect';

export const TimeseriesRelationshipDirect: React.FC<
  RelationshipDirectProps
> = ({ id, rows, columns, type }) => {
  const navigate = useNavigation();

  const { data, isLoading, isFetched, isError } =
    useInstanceDirectRelationshipQuery<{
      externalId: string;
    } | null>(type);

  const handleRedirectClick = () => {
    if (!data?.externalId) {
      return;
    }

    navigate.toTimeseriesPage(data?.externalId);
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
        type="TimeSeries"
        header={capitalize(type.field)}
        title={renderValueTitle()}
      >
        <InstancePreview.Timeseries
          id={data?.externalId as any}
          disabled={isDisabled}
        >
          <Button.InternalRedirect
            onClick={() => {
              handleRedirectClick();
            }}
            disabled={isLoading || isDisabled}
          />
        </InstancePreview.Timeseries>
      </Widget.Header>
    </Widget>
  );
};
