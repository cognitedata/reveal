import React from 'react';
import { useGetRootAsset } from 'hooks';
import { Button } from '@cognite/cogs.js';
import { StyledButton } from './columns';
import { createLink } from '@cognite/cdf-utilities';

type Props = {
  value: number;
};

export const RootAssetCell: React.FC<Props> = ({ value }: Props) => {
  const { data: rootAsset, isLoading } = useGetRootAsset(value);

  return isLoading || rootAsset?.name ? (
    <Button
      onClick={e => e.stopPropagation()}
      type="link"
      target="_blank"
      href={createLink(`/explore/asset/${value}`)}
      icon="ArrowUpRight"
      iconPlacement="right"
    >
      <StyledButton>{rootAsset?.name}</StyledButton>
    </Button>
  ) : null;
};
