import { Typography } from '@fdx/components';
import { useInstanceRelationshipQuery } from '@fdx/services/instances/generic/queries/useInstanceRelationshipQuery';
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

export const GenericRelationshipEdgeView: React.FC<
  InstancePreviewProps & { type: { type: string; field: string } }
> = ({ onClick, instance, dataModel, type }) => {
  const { toInstancePage } = useNavigation();

  const { data } = useInstanceRelationshipQuery(
    type,
    undefined,
    {
      model: dataModel,
      instance,
    },
    {
      enabled: !empty(instance) && !empty(dataModel),
    }
  );

  const handleClick = (item: any) => {
    toInstancePage(type.type, item?.space, item?.externalId, {
      ...dataModel,
      dataModel: dataModel?.externalId,
    });
  };

  return (
    <>
      <InstancePreviewHeader>
        <Flex alignItems="center" gap={4}>
          <Button icon="ArrowLeft" type="ghost" onClick={() => onClick?.()} />
          <Typography.Title capitalize size="small">
            {type.field}
          </Typography.Title>
          <Typography.Title size="xsmall">
            {data?.items?.length}
          </Typography.Title>
        </Flex>
      </InstancePreviewHeader>

      {data?.items?.map((item: any) => (
        <Link
          key={item.externalId}
          type="ghost-accent"
          icon="ArrowUpRight"
          iconPlacement="right"
          onClick={() => handleClick(item)}
        >
          {item.name || item.externalId}
        </Link>
      ))}
    </>
  );
};

export const GenericRelationshipEdgeItem: React.FC<
  InstancePreviewProps & { type: { type: string; field: string } }
> = ({ dataModel, instance, type, onClick }) => {
  const {
    data: { items },
    isFetched,
  } = useInstanceRelationshipQuery(
    type,
    undefined,
    {
      model: dataModel,
      instance,
    },
    {
      enabled: !empty(instance) && !empty(dataModel),
    }
  );

  const isEmpty = isFetched && empty(items);

  if (isEmpty) {
    return null;
  }

  return (
    <RelationshipEdgeContainer tabIndex={0} onClick={() => onClick?.(type)}>
      <TypeText>{type.field}</TypeText>
      <RelationshipEdgeContent>
        <Typography.Title size="xsmall">{items.length}</Typography.Title>
        <Icon type="ArrowRight" />
      </RelationshipEdgeContent>
    </RelationshipEdgeContainer>
  );
};
