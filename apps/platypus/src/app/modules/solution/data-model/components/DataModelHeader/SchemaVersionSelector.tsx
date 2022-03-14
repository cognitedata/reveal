import { SchemaVersionSelect } from '@platypus-app/modules/solution/components/SchemaVersionSelect/SchemaVersionSelect';
import { SCHEMA_VERSION_LABEL } from '@platypus-app/utils/config';
import { useHistory } from 'react-router-dom';
import { SchemaEditorMode } from '../../types';
import { StyledSchemaVersion } from './elements';

export interface SchemaVersionSelectorProps {
  solutionId: string;
  schemasVersions: string[];
  editorMode: SchemaEditorMode;
  selectedVersion: string;
}

export const SchemaVersionSelector = (props: SchemaVersionSelectorProps) => {
  const history = useHistory();

  if (!props.schemasVersions) {
    return null;
  }

  if (props.editorMode === SchemaEditorMode.View) {
    return (
      <SchemaVersionSelect
        selectedVersion={props.selectedVersion}
        versions={props.schemasVersions}
        onChange={(selectedValue: string) => {
          history.replace(
            `/solutions/${props.solutionId}/${selectedValue}/data`
          );
        }}
      />
    );
  }

  return (
    <StyledSchemaVersion>
      {SCHEMA_VERSION_LABEL(props.selectedVersion)}
    </StyledSchemaVersion>
  );
};
