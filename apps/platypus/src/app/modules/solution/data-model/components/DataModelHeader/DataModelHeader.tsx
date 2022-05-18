import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { SchemaVersionDropdown } from '@platypus-app/modules/solution/components/SchemaVersionDropdown/SchemaVersionDropdown';
import { SolutionSchema } from '@platypus/platypus-core';
import { useHistory } from 'react-router-dom';
import { SchemaEditorMode } from '../../types';
import { SelectorWrapper } from './elements';

export interface DataModelHeaderProps {
  editorMode: SchemaEditorMode;
  solutionId: string;
  selectedSchema: SolutionSchema;
  selectSchema: (schema: SolutionSchema) => void;
  schemas: SolutionSchema[];
  children?: React.ReactNode;
  draftSaved: boolean;
}

export const DataModelHeader = (props: DataModelHeaderProps) => {
  const { t } = useTranslation('DataModelHeader');
  const history = useHistory();
  const versionsSelector =
    props.schemas.length && props.selectedSchema ? (
      <div key="versions-selector">
        <SchemaVersionDropdown
          onVersionSelect={(solutionSchema) => {
            history.replace(
              `/solutions/${props.solutionId}/${solutionSchema.version}/data`
            );
            props.selectSchema(solutionSchema);
          }}
          selectedVersion={props.selectedSchema}
          versions={props.schemas}
        />
      </div>
    ) : null;

  const behindTitle = [versionsSelector];
  if (props.draftSaved) {
    behindTitle.push(
      <span data-cy="changes-saved-status-text" style={{ marginLeft: 15 }}>
        {t('all_changes_saved', 'All changes saved')}
      </span>
    );
  }

  return (
    <div>
      <PageToolbar
        title={t('data_model_title', 'Data model')}
        behindTitle={<SelectorWrapper>{behindTitle}</SelectorWrapper>}
      >
        <PageToolbar.Tools>{props.children}</PageToolbar.Tools>
      </PageToolbar>
    </div>
  );
};
