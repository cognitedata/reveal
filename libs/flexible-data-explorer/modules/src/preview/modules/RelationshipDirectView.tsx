import styled from 'styled-components';

import { Typography } from '@fdx/components';
import { useInstanceDirectRelationshipQuery } from '@fdx/services/instances/generic/queries/useInstanceDirectRelationshipQuery';
import { useNavigation } from '@fdx/shared/hooks/useNavigation';
import _isEmpty from 'lodash/isEmpty';

import { Icon } from '@cognite/cogs.js';

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
      enabled: !_isEmpty(instance) && !_isEmpty(dataModel),
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

      <Typography.Body size="xsmall" capitalize>
        {type.field}
      </Typography.Body>
      <Typography.Title size="xsmall">
        {data?.name || data?.externalId}
      </Typography.Title>
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
