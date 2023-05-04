import { Button } from '@cognite/cogs.js';
import React from 'react';

export const ButtonFavorite = React.memo(
  ({ loading }: { loading?: boolean }) => {
    return (
      <Button
        icon="Favorite"
        type="tertiary"
        aria-label="favorite resource"
        disabled={loading}
      />
    );
  }
);
