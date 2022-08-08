import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { SchemaVersionDropdown } from '@platypus-app/components/SchemaVersionDropdown/SchemaVersionDropdown';
import { DataModelVersion } from '@platypus/platypus-core';
import { SelectorWrapper } from './elements';

export interface DataModelHeaderProps {
  title: string;
  selectedDataModelVersion: DataModelVersion;
  onSelectDataModelVersion: (schema: DataModelVersion) => void;
  schemas: DataModelVersion[];
  children?: React.ReactNode;
  draftSaved: boolean;
}

export const DataModelHeader = (props: DataModelHeaderProps) => {
  const { t } = useTranslation('DataModelHeader');

  return (
    <div>
      <PageToolbar
        title={props.title || ''}
        behindTitle={
          <SelectorWrapper>
            {props.selectedDataModelVersion ? (
              <SchemaVersionDropdown
                onVersionSelect={(solutionSchema) => {
                  props.onSelectDataModelVersion(solutionSchema);
                }}
                selectedVersion={props.selectedDataModelVersion}
                versions={props.schemas}
              />
            ) : null}
            {props.draftSaved ? (
              <span
                data-cy="changes-saved-status-text"
                style={{ marginLeft: 15 }}
              >
                {t('all_changes_saved', 'All changes saved')}
              </span>
            ) : null}
          </SelectorWrapper>
        }
      >
        {props.children}
      </PageToolbar>
    </div>
  );
};
