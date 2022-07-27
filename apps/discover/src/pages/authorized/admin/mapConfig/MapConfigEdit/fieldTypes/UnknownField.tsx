import * as React from 'react';

import { ItemWrapper } from './elements';

export const UnknownField: React.FC<{ id: string; type: string }> = ({
  id,
  type,
}) => {
  return (
    <ItemWrapper>
      Unknown type: {id} ({type})
    </ItemWrapper>
  );
};
