/*!
 * Copyright 2024 Cognite AS
 */
import { type ReactElement } from 'react';
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
