import React from 'react';

import { CogniteOrnate } from '../ornate';

export type OrnateContextProps = {
  ornateInstance: CogniteOrnate | null;
};

export const OrnateContext = React.createContext<OrnateContextProps>({
  ornateInstance: null,
});
