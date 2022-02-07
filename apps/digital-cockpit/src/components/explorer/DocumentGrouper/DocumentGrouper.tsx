import { Collapse } from '@cognite/cogs.js';
import { FileInfo } from '@cognite/sdk';
import { useMemo } from 'react';

import { StyledCollapse } from './elements';

export type DocumentGrouperProps = {
  files: FileInfo[];
  groupByField: string;
  nameMappings?: Record<string, string>;
  children: (files: FileInfo[], type: string) => React.ReactNode;
  odd?: boolean;
};

type Group = {
  fieldValue: string;
  files: FileInfo[];
};

export const reduceToGroups = (
  acc: Record<string, Group>,
  file: FileInfo,
  fieldKey: string
) => {
  const fieldValue = file.metadata?.[fieldKey] || 'Uncategorized';
  if (!acc[fieldValue]) {
    acc[fieldValue] = {
      fieldValue,
      files: [file],
    };
  } else {
    acc[fieldValue].files = [...acc[fieldValue].files, file];
  }
  return acc;
};

const DocumentGrouper = ({
  files,
  groupByField,
  nameMappings = {},
  children,
}: DocumentGrouperProps) => {
  const groupedFiles = useMemo(
    () =>
      Object.values(
        files.reduce(
          (acc, file) => reduceToGroups(acc, file, groupByField),
          {} as Record<string, Group>
        )
      ),
    [files, groupByField]
  );

  return (
    <StyledCollapse>
      {groupedFiles.map((group) => (
        <Collapse.Panel
          header={`${nameMappings?.[group.fieldValue] || group.fieldValue} (${
            group.files.length
          })`}
          key={group.fieldValue}
        >
          {children(group.files, group.fieldValue)}
        </Collapse.Panel>
      ))}
    </StyledCollapse>
  );
};

export default DocumentGrouper;
