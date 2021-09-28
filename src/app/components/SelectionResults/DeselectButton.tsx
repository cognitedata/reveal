import React from 'react';
import { Button } from '@cognite/cogs.js';
import { useQueryStringArray } from 'app/hooks';
import { CART_KEY } from 'app/utils/constants';
import { Tooltip } from 'antd';

export default function DeselectButton() {
  const setCart = useQueryStringArray(CART_KEY)[1];
  return (
    <Tooltip title="Clear selection">
      <Button icon="Close" onClick={() => setCart([])} />
    </Tooltip>
  );
}
