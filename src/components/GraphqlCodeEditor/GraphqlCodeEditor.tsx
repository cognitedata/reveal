import Editor from '@monaco-editor/react';

type Props = {
  code: string;
  onChange: (code: string) => void;
  disabled?: boolean;
};

export const GraphqlCodeEditor = ({
  onChange,
  code,
  disabled = false,
}: Props) => (
  <Editor
    options={{
      minimap: { enabled: false },
      autoClosingBrackets: 'always',
      readOnly: disabled,
    }}
    language="graphql"
    value={code}
    onChange={(value) => {
      const editCode = value || '';
      onChange(editCode);
    }}
  />
);
