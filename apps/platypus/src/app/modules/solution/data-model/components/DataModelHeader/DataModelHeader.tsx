import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { SchemaVersionDropdown } from '@platypus-app/modules/solution/components/SchemaVersionDropdown/SchemaVersionDropdown';
import { DataModelVersion } from '@platypus/platypus-core';
import { useHistory } from 'react-router-dom';
import { SchemaEditorMode } from '../../types';
import { SelectorWrapper } from './elements';

export interface DataModelHeaderProps {
  editorMode: SchemaEditorMode;
  solutionId: string;
  selectedSchema: DataModelVersion;
  selectSchema: (schema: DataModelVersion) => void;
  schemas: DataModelVersion[];
  children?: React.ReactNode;
  draftSaved: boolean;
}

export const DataModelHeader = (props: DataModelHeaderProps) => {
  const { t } = useTranslation('DataModelHeader');
  const history = useHistory();

  return (
    <div>
      <PageToolbar
        title={t('data_model_title', 'Data model')}
        behindTitle={
          <SelectorWrapper>
            {props.schemas.length && props.selectedSchema ? (
              <SchemaVersionDropdown
                onVersionSelect={(solutionSchema) => {
                  history.replace(
                    `/data-models/${props.solutionId}/${solutionSchema.version}/data`
                  );
                  props.selectSchema(solutionSchema);
                }}
                selectedVersion={props.selectedSchema}
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
