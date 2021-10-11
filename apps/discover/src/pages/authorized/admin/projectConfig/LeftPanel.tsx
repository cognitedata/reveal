import * as React from 'react';

import { ConfigFields } from './ConfigFields';
import { ProjectConfigSidebar } from './elements';
import { Metadata } from './types';

type Props = {
  metadata: Metadata;
  selected: string;
  setSelected: React.Dispatch<React.SetStateAction<string>>;
};

export const LeftPanel: React.FC<Props> = ({
  selected,
  metadata,
  setSelected,
}) => {
  return (
    <ProjectConfigSidebar justifyContent="space-between" direction="column">
      <ConfigFields
        prefix=""
        defaultActiveKey={selected}
        metadata={metadata}
        selected={selected}
        setSelected={setSelected}
      />
    </ProjectConfigSidebar>
  );
};
