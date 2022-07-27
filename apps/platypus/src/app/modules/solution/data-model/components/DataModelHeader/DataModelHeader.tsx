import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { SchemaVersionDropdown } from '@platypus-app/modules/solution/components/SchemaVersionDropdown/SchemaVersionDropdown';
import { DataModelVersion } from '@platypus/platypus-core';
import { SchemaEditorMode } from '../../types';
import { SelectorWrapper } from './elements';

export interface DataModelHeaderProps {
  editorMode: SchemaEditorMode;
  solutionId: string;
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
        title={t('data_model_title', 'Data model')}
        behindTitle={
          <SelectorWrapper>
            {props.schemas.length && props.selectedDataModelVersion ? (
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
