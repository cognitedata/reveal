import { type ReactElement } from 'react';
import { ActiveToolToolbar } from './Toolbar';
import { DomainObjectPanel } from './DomainObjectPanel';
import { AnchoredDialog } from './AnchoredDialog';
import { TreeViewContainer } from './TreeViewContainer';
import { FilterContainer } from './FilterContainer';

export const ToolUI = (): ReactElement => {
  return (
    <>
      <ActiveToolToolbar />
      <DomainObjectPanel />
      <AnchoredDialog />
      <TreeViewContainer />
      <FilterContainer />
    </>
  );
};
