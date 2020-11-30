import React from 'react';
import { Button } from '@cognite/cogs.js';
import { useQueryStringArray } from 'app/hooks';
import { CART_KEY } from 'app/utils/contants';

export default function DeselectButton() {
  const setCart = useQueryStringArray(CART_KEY)[1];
  return (
    <Button variant="outline" onClick={() => setCart([])}>
      Clear selection
    </Button>
  );
}
