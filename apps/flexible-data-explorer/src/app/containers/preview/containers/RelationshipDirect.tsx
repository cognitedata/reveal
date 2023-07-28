import styled from 'styled-components';

import _isEmpty from 'lodash/isEmpty';

import { Body, Icon, Title } from '@cognite/cogs.js';

import { useNavigation } from '../../../hooks/useNavigation';
import { useInstanceDirectRelationshipQuery } from '../../../services/instances/generic/queries/useInstanceDirectRelationshipQuery';
import { InstancePreviewProps } from '../types';

export const DirectionRelationshipItem: React.FC<
  InstancePreviewProps & { type: { type: string; field: string } }
> = ({ dataModel, instance, type }) => {
  const { toInstancePage } = useNavigation();

  const { data, isFetched } = useInstanceDirectRelationshipQuery(
    type,
    {
      model: dataModel,
      instance,
    },
    {
      suspense: true,
    }
  );

  const handleClick = () => {
    toInstancePage(type.type, data?.space, data?.externalId, {
      ...dataModel,
      dataModel: dataModel?.externalId,
    });
  };

  const isEmpty = isFetched && _isEmpty(data);

  if (isEmpty) {
    return null;
  }

  return (
    <Container
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleClick();
        }
      }}
      tabIndex={0}
    >
      <Icon type="ArrowUpRight" />

      <Text>{type.field}</Text>
      <ValueText>{data?.name}</ValueText>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 25%;
  padding: 10px 12px;
  height: 86px;
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

const ValueText = styled(Title).attrs({ level: 6, strong: true })`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
