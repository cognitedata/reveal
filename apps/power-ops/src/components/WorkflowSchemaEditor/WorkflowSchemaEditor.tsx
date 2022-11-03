import { Button, Icon, Label } from '@cognite/cogs.js';
import Editor, { BeforeMount } from '@monaco-editor/react';
import { WorkflowSchemaEditable } from 'types';
import { editor } from 'monaco-editor';
import { ComponentProps, useEffect, useRef, useState } from 'react';
import WorkflowJSONSchema from 'types/WorkflowSchemaEditable.schema.json';

interface Props {
  value: WorkflowSchemaEditable;
  onSave: (newValue: WorkflowSchemaEditable) => void;
  height: ComponentProps<typeof Editor>['height'];
}

const validateCode = (code: any): code is string => {
  try {
    JSON.parse(code);
    return true;
  } catch (e) {
    return false;
  }
};

export const WorkflowSchemaEditor = ({
  value,
  onSave,
  height = 'calc(100vh - 36px)',
}: Props) => {
  const editorRef = useRef<editor.IStandaloneCodeEditor>();

  const [valid, setValid] = useState(true);
  const [editedWorkflowSchema, setEditedWorkflowSchema] = useState(value);

  const workflowSchemaChanged =
    JSON.stringify(value) !== JSON.stringify(editedWorkflowSchema);
  const canSave = valid && workflowSchemaChanged;

  const setupEditor: BeforeMount = (monaco) => {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      schemas: [
        {
          uri: 'http://power-ops/schema.json',
          fileMatch: ['*'],
          schema: WorkflowJSONSchema,
        },
      ],
    });
  };

  useEffect(() => {
    setEditedWorkflowSchema(value);
  }, [value]);

  const saveButtonTitle = () => {
    if (canSave) return 'Save';
    if (!valid) return 'Schema is not valid';
    if (!workflowSchemaChanged) return "Workflow didn't change";
    return "Can't save";
  };

  return (
    <div>
      <div>
        <Button
          icon="Save"
          disabled={!canSave}
          title={saveButtonTitle()}
          onClick={() => canSave && onSave(editedWorkflowSchema)}
          aria-label="Save"
        />
        <Label
          variant={valid ? 'success' : 'danger'}
          icon={valid ? 'Checkmark' : 'CloseLarge'}
          // @ts-expect-error Cogs doesn't handle this properly
          title={valid ? 'Valid' : 'Invalid'}
          style={{ marginRight: 5 }}
        />
      </div>
      <Editor
        height={height}
        language="json"
        loading={<Icon type="Loader" />}
        value={JSON.stringify(editedWorkflowSchema, null, 2)}
        onMount={(editor) => {
          editorRef.current = editor;
          editor.getAction('editor.action.formatDocument').run();
        }}
        beforeMount={setupEditor}
        onChange={(code) => {
          if (!validateCode(code)) return;
          setEditedWorkflowSchema(JSON.parse(code));
        }}
        onValidate={(markers) => setValid(markers.length === 0)}
        options={{
          formatOnType: true,
          formatOnPaste: true,
        }}
      />
    </div>
  );
};
