import type { IAceEditorProps } from 'react-ace';
import AceEditor from 'react-ace';

import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-tomorrow';
import 'ace-builds/src-noconflict/ext-language_tools';

export function Editor(props: IAceEditorProps) {
  return <AceEditor mode="json" theme="tomorrow" width="100%" {...props} />;
}
