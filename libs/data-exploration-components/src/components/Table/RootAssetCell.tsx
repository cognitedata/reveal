import React from 'react';
import { useGetRootAsset } from '@data-exploration-components/hooks';
import { Link } from '@cognite/cogs.js';
import { StyledButton } from './elements';
import { createLink } from '@cognite/cdf-utilities';

type Props = {
  value: number;
};

export const RootAssetCell: React.FC<Props> = ({ value }: Props) => {
  const { data: rootAsset, isLoading } = useGetRootAsset(value);

  return isLoading || rootAsset?.name ? (
    <Link target="_blank" href={createLink(`/explore/asset/${value}`)}>
      <StyledButton>{rootAsset?.name}</StyledButton>
    </Link>
  ) : null;
};
