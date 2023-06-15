import { useState } from 'react';

import {
  ActiveTableProvider,
  RawExplorerContextProvider,
} from '@transformations/contexts';

import RawPreviewProfiling from './RawPreviewProfiling';
import RawPreviewTable from './RawPreviewTable';

export enum RawTabView {
  Raw = 'raw',
  Profiling = 'profiling',
}

type RawPreviewContentProps = {
  className?: string;
  database: string;
  table: string;
};

const RawPreviewContent = ({
  className,
  database,
  table,
}: RawPreviewContentProps) => {
  const [activeView, setActiveView] = useState<RawTabView>(RawTabView.Raw);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <RawExplorerContextProvider>
      <ActiveTableProvider>
        {activeView === RawTabView.Profiling ? (
          <RawPreviewProfiling
            className={className}
            database={database}
            table={table}
            activeView={activeView}
            setActiveView={setActiveView}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />
        ) : (
          <RawPreviewTable
            className={className}
            database={database}
            table={table}
            activeView={activeView}
            setActiveView={setActiveView}
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />
        )}
      </ActiveTableProvider>
    </RawExplorerContextProvider>
  );
};

export default RawPreviewContent;
