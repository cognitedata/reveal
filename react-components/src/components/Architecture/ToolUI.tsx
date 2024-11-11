import { ReactElement } from 'react';
import { ActiveToolToolbar } from './Toolbar';
import { DomainObjectPanel } from './DomainObjectPanel';
import { AnchoredDialog } from './AnchoredDialog';

export const ToolUI = (): ReactElement => {
  return (
    <>
      <ActiveToolToolbar />
      <DomainObjectPanel />
      <AnchoredDialog />
    </>
  );
};
