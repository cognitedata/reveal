import { Input } from '@cognite/cogs.js';
import { useState } from 'react';
import { Vector3 } from 'three';

const PoiCreationDialog = (point: Vector3) => {
  const [name, setName] = useState<string>('');

  return (
    <div>
      <Input value={name} />
    </div>
  );
};
