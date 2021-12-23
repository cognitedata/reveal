import { PageToolbar } from '@platypus-app/components/PageToolbar/PageToolbar';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

import { SolutionSchema } from '@platypus/platypus-core';
import { SchemaEditorMode } from '../../types';
import { SchemaVersionSelector } from './SchemaVersionSelector';

export interface DataModelHeaderProps {
  editorMode: SchemaEditorMode;
  solutionId: string;
  selectedSchema: SolutionSchema | undefined;
  schemas: SolutionSchema[];
  children?: React.ReactNode;
}

export const DataModelHeader = (props: DataModelHeaderProps) => {
  const { t } = useTranslation('DataModelHeader');

  const versionsSelector =
    props.schemas.length && props.selectedSchema ? (
      <SchemaVersionSelector
        editorMode={props.editorMode}
        solutionId={props.solutionId}
        schemasVersions={props.schemas.map((s) => s.version)}
        selectedVersion={props.selectedSchema.version}
      />
    ) : null;

  return (
    <div>
      <PageToolbar
        title={t('data_model_title', 'Data model')}
        behindTitle={versionsSelector}
      >
        <PageToolbar.Tools>{props.children}</PageToolbar.Tools>
      </PageToolbar>
    </div>
  );
};
