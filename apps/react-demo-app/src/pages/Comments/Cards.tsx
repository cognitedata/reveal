import React from 'react';
import { Asset } from '@cognite/sdk';
import { Body } from '@cognite/cogs.js';
import { SetCommentTarget } from '@cognite/react-comments';

import { CardContainer, Elevation } from './elements';

interface ICard {
  asset: Asset;
  setCommentTarget: SetCommentTarget;
}
export const Card: React.FC<ICard> = ({ asset, setCommentTarget }) => {
  return (
    <Elevation
      className="z-4"
      key={asset.id}
      onClick={() => {
        setCommentTarget({
          id: `${asset.id}`,
          targetType: 'asset',
        });
      }}
    >
      <Body>
        <div>Asset ID: {asset.id}</div>
        <div>Asset name: {asset.name}</div>
      </Body>
    </Elevation>
  );
};

export const Cards: React.FC<{
  assets: ICard['asset'][];
  setCommentTarget: ICard['setCommentTarget'];
}> = ({ assets, setCommentTarget }) => {
  return (
    <CardContainer>
      {assets.map((asset) => (
        <Card
          key={`slider-${asset.id}`}
          setCommentTarget={setCommentTarget}
          asset={asset}
        />
      ))}
    </CardContainer>
  );
};
