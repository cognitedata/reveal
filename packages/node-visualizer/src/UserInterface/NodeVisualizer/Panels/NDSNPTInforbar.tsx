import { Infobar } from '@cognite/cogs.js';
import * as React from 'react';
import { NPT_NDS_INFO_MESSAGE } from './constants';

type Props = {
  enable: boolean;
  setView: (view: boolean) => void;
};

export const NDSNPTInforbar: React.FC<Props> = ({ enable, setView }: Props) => {
  if (!enable) {
    return null;
  }

  return (
    <Infobar
      close
      onClose={() => {
        setView(false);
      }}
    >
      {NPT_NDS_INFO_MESSAGE}
    </Infobar>
  );
};
