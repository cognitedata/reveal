import { Typography } from '@fdx/components';
import { useInstanceDirectRelationshipQuery } from '@fdx/services/instances/generic/queries/useInstanceDirectRelationshipQuery';
import { useNavigation } from '@fdx/shared/hooks/useNavigation';
import empty from 'lodash/isEmpty';

import { Button, Flex, Icon } from '@cognite/cogs.js';

import { InstancePreviewHeader } from '../../elements';
import { InstancePreviewProps } from '../../types';

import {
  Link,
  RelationshipEdgeContainer,
  RelationshipEdgeContent,
  TypeText,
} from './elements';

export const TimeseriesRelationshipEdgeView: React.FC<
  InstancePreviewProps & { type: { type: string; field: string } }
> = ({ onClick, instance, dataModel, type }) => {
  const { toTimeseriesPage } = useNavigation();

  const { data } = useInstanceDirectRelationshipQuery<
    ({
      externalId: string;
    } | null)[]
  >(
    type,
    {
      model: dataModel,
      instance,
    },
    {
      enabled: !empty(instance) && !empty(dataModel),
    }
  );

  const handleClick = (externalId: string) => {
    toTimeseriesPage(externalId);
  };

  return (
    <>
      <InstancePreviewHeader>
        <Flex alignItems="center" gap={4}>
          <Button icon="ArrowLeft" type="ghost" onClick={() => onClick?.()} />
          <Typography.Title capitalize size="small">
            {type.field}
          </Typography.Title>
          <Typography.Title size="xsmall">{data?.length}</Typography.Title>
        </Flex>
      </InstancePreviewHeader>

      {data?.map((item) => {
        if (!item) {
          return null;
        }

        return (
          <Link
            key={item.externalId}
            type="ghost-accent"
            icon="ArrowUpRight"
            iconPlacement="right"
            onClick={() => handleClick(item.externalId)}
          >
            {item.externalId}
          </Link>
        );
      })}
    </>
  );
};

export const TimeseriesRelationshipEdgeItem: React.FC<
  InstancePreviewProps & { type: { type: string; field: string } }
> = ({ dataModel, instance, type, onClick }) => {
  const { data, isFetched } = useInstanceDirectRelationshipQuery<
    ({
      externalId: string;
    } | null)[]
  >(
    type,
    {
      model: dataModel,
      instance,
    },
    {
      enabled: !empty(instance) && !empty(dataModel),
    }
  );

  const isEmpty = isFetched && empty(data);

  if (isEmpty) {
    return null;
  }

  return (
    <RelationshipEdgeContainer tabIndex={0} onClick={() => onClick?.(type)}>
      <TypeText>{type.field}</TypeText>
      <RelationshipEdgeContent>
        <Typography.Title size="xsmall">{data?.length}</Typography.Title>
        <Icon type="ArrowRight" />
      </RelationshipEdgeContent>
    </RelationshipEdgeContainer>
  );
};
