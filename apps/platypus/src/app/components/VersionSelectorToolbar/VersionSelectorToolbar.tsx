import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { SchemaVersionDropdown } from '@platypus-app/components/SchemaVersionDropdown/SchemaVersionDropdown';
import { DataModelVersion } from '@platypus/platypus-core';
import { SelectorWrapper } from './elements';

export interface VersionSelectorToolbarProps {
  title: string;
  selectedDataModelVersion: DataModelVersion;
  onDataModelVersionSelect: (schema: DataModelVersion) => void;
  schemas: DataModelVersion[];
  children?: React.ReactNode;
}

export const VersionSelectorToolbar = (props: VersionSelectorToolbarProps) => {
  return (
    <div>
      <PageToolbar
        title={props.title || ''}
        behindTitle={
          <SelectorWrapper>
            {props.selectedDataModelVersion ? (
              <SchemaVersionDropdown
                onVersionSelect={(solutionSchema) => {
                  props.onDataModelVersionSelect(solutionSchema);
                }}
                selectedVersion={props.selectedDataModelVersion}
                versions={props.schemas}
              />
            ) : null}
          </SelectorWrapper>
        }
      >
        {props.children}
      </PageToolbar>
    </div>
  );
};
