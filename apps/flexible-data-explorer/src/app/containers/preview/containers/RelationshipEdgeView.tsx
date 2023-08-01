import styled from 'styled-components';

import { Body, Button, Flex, Icon } from '@cognite/cogs.js';

import { Typography } from '../../../components/Typography';
import { useNavigation } from '../../../hooks/useNavigation';
import { useInstanceRelationshipQuery } from '../../../services/instances/generic/queries/useInstanceRelationshipQuery';
import { InstancePreviewHeader } from '../elements';
import { InstancePreviewProps } from '../types';

export const RelationshipEdgeView: React.FC<
  InstancePreviewProps & { type: { type: string; field: string } }
> = ({ onClick, instance, dataModel, type }) => {
  const { toInstancePage } = useNavigation();

  const { data } = useInstanceRelationshipQuery(type, undefined, {
    model: dataModel,
    instance,
  });

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
          <Typography.Title size="xsmall">{data?.length}</Typography.Title>
        </Flex>
      </InstancePreviewHeader>

      {data?.map((item: any) => (
        <Link
          key={item.name}
          type="ghost-accent"
          icon="ArrowUpRight"
          iconPlacement="right"
          onClick={() => handleClick(item)}
        >
          {item.name}
        </Link>
      ))}
    </>
  );
};

export const RelationshipEdgeItem: React.FC<
  InstancePreviewProps & { type: { type: string; field: string } }
> = ({ dataModel, instance, type, onClick }) => {
  const { data, isFetched } = useInstanceRelationshipQuery(
    type,
    undefined,
    {
      model: dataModel,
      instance,
    },
    {
      suspense: true,
    }
  );

  const isEmpty = isFetched && data?.length === 0;

  if (isEmpty) {
    return null;
  }

  return (
    <Container tabIndex={0} onClick={() => onClick?.(type)}>
      <Text>{type.field}</Text>
      <Content>
        <Typography.Title size="xsmall">{data?.length}</Typography.Title>
        <Icon type="ArrowRight" />
      </Content>
    </Container>
  );
};

const Link = styled(Button)`
  width: 100%;

  && {
    display: flex;
    justify-content: space-between;
    text-align: left;
    padding-left: 4px;
    padding-right: 4px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 25%;
  height: 64px;
  padding: 10px 12px;
  width: 100%;
  border-radius: 8px;
  background: var(--surface-action-muted-default, rgba(83, 88, 127, 0.08));
  cursor: pointer;
  transition: background 0.2s ease-in-out;
  justify-content: center;

  &:hover {
    background: var(--surface-action-muted-hover, rgba(83, 88, 127, 0.12));
  }
`;

const Text = styled(Body)`
  color: var(--text-icon-muted, rgba(0, 0, 0, 0.55));
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  text-transform: capitalize;
`;

const Content = styled.div`
  display: flex;
  justify-content: space-between;
`;
