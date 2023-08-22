import { useState, useMemo, useCallback, useEffect } from 'react';

import styled from 'styled-components';

import {
  CopilotEvents,
  sendToCopilotEvent,
  useFromCopilotEventHandler,
} from '@fusion/copilot-core';
import MonacoEditor, { OnMount, loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { editor, Environment as MonacoEditorEnvironment } from 'monaco-editor';

import { trackEvent } from '@cognite/cdf-route-tracker';
import { Body, Button, Flex, Icon, Overline, Tooltip } from '@cognite/cogs.js';

import { AddFileModal } from '../components/AddFileModal';
import { DeleteFileModal } from '../components/DeleteFileModal';
import { EditFilenameModal } from '../components/EditFilenameModal';
import { FileTemplate } from '../fileTemplates';
import { AppData } from '../types';

import { getMonacoEditorWorker } from './monacoLanguageServiceWorkerLoader';

loader.config({ monaco });

const isDarkTheme = false;

// point here so the context can be used
declare const self: any;

(self as any).MonacoEnvironment = {
  getWorker(_: string, _label: string) {
    // otherwise, load the default web worker from monaco
    return getMonacoEditorWorker();
  },
} as MonacoEditorEnvironment;

export function parseRequirementsTxt(content: string): string[] {
  return content
    .split('\n')
    .filter((r) => !r.startsWith('#'))
    .map((r) => r.trim())
    .filter((r) => r !== '');
}

const REQUIREMENTS_FILENAME = 'requirements';

export interface EditorProps {
  appData: AppData;
  filesWithChanges: string[];
  onChange: (file: string, value: string) => void;
  onRequirementsChange: (requirements: string[]) => void;
  onShowSettingsClicked: () => void;
  onAppFilesChange: (newAppData: AppData) => void;
}

export const Editor = ({
  appData,
  onChange,
  filesWithChanges,
  onShowSettingsClicked,
  onAppFilesChange,
}: EditorProps) => {
  // Keep the tab order
  const [fileNames, setFileNames] = useState<string[]>([]);
  const [currentFileName, setCurrentFileName] = useState<string>();
  const [showAddFileModal, setShowAddFileModal] = useState(false);
  const [showDeleteFileModal, setShowDeleteFileModal] = useState(false);
  const [showEditFilenameModal, setShowEditFilenameModal] = useState(false);

  useEffect(() => {
    const newFileNames = Object.keys(appData.files).sort((a, b) => {
      // Prioritize the entrypoint
      if (a === appData.entrypoint) {
        return -1;
      } else if (b === appData.entrypoint) {
        return 1;
      }

      return a.localeCompare(b);
    });
    setFileNames(newFileNames);
  }, [appData.files, appData.entrypoint]);

  useEffect(() => {
    if (currentFileName && !fileNames.includes(currentFileName)) {
      // If we are currently viewing the old entrypoint, select the new one
      fileNames.forEach((fileName) => {
        if (fileName.includes('pages/' + currentFileName)) {
          setCurrentFileName(fileName);
        }
      });

      // If we are currently viewing the new entrypoint, select it
      if (currentFileName.replace('pages/', '') === appData.entrypoint) {
        setCurrentFileName(appData.entrypoint);
      }
    }

    if (currentFileName) {
      // The current file is already set
      return;
    }

    // Select entry point if it exists, otherwise select the first file
    if (fileNames.length > 0) {
      setCurrentFileName(
        appData.entrypoint && fileNames.includes(appData.entrypoint)
          ? appData.entrypoint
          : fileNames[0]
      );
    }
  }, [fileNames, appData.entrypoint, currentFileName]);

  const currentFile =
    typeof currentFileName === 'string' ? appData.files[currentFileName] : null;

  const [editorRef, setEditorRef] = useState<
    editor.IStandaloneCodeEditor | undefined
  >();
  const [monacoRef, setMonacoRef] = useState<typeof monaco | undefined>();
  const handleEditorDitMount = useCallback<OnMount>((newEditor, newMonaco) => {
    setEditorRef(newEditor);
    setMonacoRef(newMonaco);
  }, []);

  const handleAddFile = useCallback(
    (fileName: string, template: FileTemplate) => {
      appData.files = {
        ...appData.files,
        [fileName]: {
          content: {
            $case: 'text',
            text: template.code,
          },
        },
      };

      trackEvent('StreamlitApps.AddFile', {
        fileName,
        template: template.title,
      });

      onAppFilesChange(appData);
      setCurrentFileName(fileName);
      setShowAddFileModal(false);
    },
    [appData, onAppFilesChange]
  );

  const handleDeleteFile = useCallback(() => {
    if (!currentFileName) {
      return;
    }

    const currentIndex = fileNames.indexOf(currentFileName);

    delete appData.files[currentFileName];
    appData.files = {
      ...appData.files,
    };

    trackEvent('StreamlitApps.DeleteFile', {
      currentFileName,
    });

    onAppFilesChange(appData);
    setCurrentFileName(fileNames[currentIndex - 1]);
    setShowDeleteFileModal(false);
  }, [appData, currentFileName, fileNames, onAppFilesChange]);

  const handleEditFilename = useCallback(
    (newFileName: string) => {
      if (!currentFileName) {
        return;
      }

      const fullNewFileName = currentFileName.startsWith('pages/')
        ? `pages/${newFileName}`
        : newFileName;

      const buf = appData.files[currentFileName];
      delete appData.files[currentFileName];
      appData.files[fullNewFileName] = buf;

      const currentIndex = fileNames.indexOf(currentFileName);
      fileNames[currentIndex] = fullNewFileName;

      const isEntryPoint = appData.entrypoint === currentFileName;
      trackEvent('StreamlitApps.EditFilenName', {
        oldFileName: currentFileName,
        newFileName: fullNewFileName,
        isEntryPoint,
      });

      if (isEntryPoint) {
        appData.entrypoint = fullNewFileName;
      }

      onAppFilesChange(appData);
      setCurrentFileName(fullNewFileName);
      setFileNames([...fileNames]);
      setShowEditFilenameModal(false);
    },
    [appData, currentFileName, fileNames, onAppFilesChange]
  );

  useEffect(() => {
    return () => {
      if (monacoRef) {
        // Clear all the existing models. Ref: https://stackoverflow.com/a/62466612/13103190
        // If we don't do it, the previous content will remain after changing the sample apps.
        monacoRef.editor.getModels().forEach((model) => model.dispose());
      }
    };
  }, [monacoRef]);

  const getCodeHandler = useCallback(() => {
    sendToCopilotEvent('GET_CODE', {
      content: editorRef?.getModel()?.getValue() || '',
    });
  }, [editorRef]);

  useFromCopilotEventHandler('GET_CODE', getCodeHandler);

  const sendSelectionHandler = useCallback(() => {
    if (editorRef) {
      const selection = editorRef.getSelection();
      sendToCopilotEvent('GET_CODE_FOR_SELECTION', {
        content: selection
          ? editorRef.getModel()?.getValueInRange(selection) || ''
          : '',
      });
    }
  }, [editorRef]);

  useFromCopilotEventHandler('GET_CODE_FOR_SELECTION', sendSelectionHandler);

  const sendCodeHandler = useCallback(
    (event: CopilotEvents['FromCopilot']['USE_CODE']) => {
      onChange(currentFileName!, event.content || '');
    },
    [currentFileName, onChange]
  );

  useFromCopilotEventHandler('USE_CODE', sendCodeHandler);

  const showTextEditor =
    currentFile?.content?.$case === 'text' ||
    currentFileName === REQUIREMENTS_FILENAME;

  const defaultRequirementsTextValue = useMemo(
    () => appData.requirements.join('\n'),
    [appData.requirements]
  );

  const { pages, libraries } = useMemo(() => {
    return fileNames.reduce(
      (prev, currFile) => {
        if (currFile.startsWith('pages/') || currFile === appData.entrypoint) {
          prev.pages.push(currFile);
        } else {
          prev.libraries.push(currFile);
        }
        return prev;
      },
      { pages: [], libraries: [] } as {
        pages: string[];
        libraries: string[];
      }
    );
  }, [fileNames, appData.entrypoint]);

  return (
    <>
      <Flex
        direction="column"
        alignItems="flex-start"
        justifyContent="start"
        style={{ height: '100%', width: 240, padding: 16 }}
      >
        <Flex
          justifyContent="flex-start"
          direction="column"
          style={{
            flex: 1,
            overflow: 'hidden',
            width: '100%',
          }}
          gap={8}
        >
          <Overline>Pages</Overline>
          {pages.map((fileName) => (
            <PageItem
              key={fileName}
              onClick={() => setCurrentFileName(fileName)}
              active={currentFileName === fileName}
              fileName={fileName}
              isEntryPoint={appData.entrypoint === fileName}
              onDelete={() => setShowDeleteFileModal(true)}
              onEditFilename={() => setShowEditFilenameModal(true)}
              hasChanges={filesWithChanges.includes(fileName)}
            />
          ))}
          {pages.length === 0 && (
            <Body level={3} muted>
              No pages
            </Body>
          )}
          <Overline style={{ marginTop: 16 }}>Library</Overline>
          {libraries.map((fileName) => (
            <PageItem
              key={fileName}
              fileName={fileName}
              isEntryPoint={appData.entrypoint === fileName}
              active={currentFileName === fileName}
              onDelete={() => setShowDeleteFileModal(true)}
              onEditFilename={() => setShowEditFilenameModal(true)}
              hasChanges={filesWithChanges.includes(fileName)}
              onClick={() => setCurrentFileName(fileName)}
            />
          ))}
          {libraries.length === 0 && (
            <Body level={3} muted>
              No libraries
            </Body>
          )}
        </Flex>
        <Button
          onClick={() => setShowAddFileModal(true)}
          icon="AddLarge"
          type="ghost"
        >
          Add file
        </Button>

        <Button
          onClick={() => onShowSettingsClicked()}
          icon="Settings"
          type="ghost"
        >
          Settings
        </Button>
      </Flex>

      <Flex
        // NOTE: Keep the monaco-editor component being mounted
        // and control its visibility with the hidden attribute here
        // instead of mounting/unmounting the component according to the file type
        // because it leads to flickering.
        hidden={!showTextEditor}
        style={{
          flex: 1,
          paddingTop: 8,
          background: '#fff',
          borderLeft: '1px solid var(--cogs-border--muted)',
        }}
      >
        <MonacoEditor
          path={
            typeof currentFileName === 'string' ? currentFileName : undefined
          }
          defaultValue={
            // eslint-disable-next-line no-nested-ternary
            currentFileName === REQUIREMENTS_FILENAME
              ? defaultRequirementsTextValue
              : currentFile?.content?.$case === 'text'
              ? currentFile.content.text
              : undefined
          }
          value={
            // eslint-disable-next-line no-nested-ternary
            currentFileName === REQUIREMENTS_FILENAME
              ? defaultRequirementsTextValue
              : currentFile?.content?.$case === 'text'
              ? currentFile.content.text
              : undefined
          }
          onChange={(change) => onChange(currentFileName!, change || '')}
          onMount={handleEditorDitMount}
          theme={isDarkTheme ? 'vs-dark' : 'light'}
          language="python"
          defaultLanguage="python"
        />
      </Flex>
      {currentFileName != null && currentFile?.content?.$case === 'data' && (
        <p>Not supported</p>
      )}
      {showAddFileModal && (
        <AddFileModal
          onCancel={() => setShowAddFileModal(false)}
          onCreate={handleAddFile}
          existingFileNames={fileNames}
        />
      )}
      {showDeleteFileModal && currentFileName && (
        <DeleteFileModal
          onCancel={() => setShowDeleteFileModal(false)}
          onOk={handleDeleteFile}
          fileName={currentFileName}
        />
      )}
      {showEditFilenameModal && currentFileName && (
        <EditFilenameModal
          onCancel={() => setShowEditFilenameModal(false)}
          onOk={handleEditFilename}
          fileName={currentFileName}
          existingFileNames={fileNames}
        />
      )}
    </>
  );
};

const PageItem = ({
  fileName,
  isEntryPoint,
  hasChanges,
  onDelete,
  onEditFilename,
  disabled,
  active,
  onClick,
}: {
  fileName: string;
  isEntryPoint: boolean;
  hasChanges?: boolean;
  disabled?: boolean;
  active?: boolean;
  onDelete: () => void;
  onEditFilename: () => void;
  onClick: () => void;
}) => {
  return (
    <ListItem
      gap={8}
      key={fileName}
      alignItems="center"
      $active={active}
      onClick={onClick}
    >
      <Icon
        type={
          fileName.startsWith('pages/') || isEntryPoint
            ? 'Document'
            : 'CodeBraces'
        }
      />
      <div
        style={{
          flex: 1,
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          whiteSpace: 'nowrap',
        }}
      >
        <Tooltip content={fileName.replace('pages/', '')} css={{ flex: 1 }}>
          <span
            style={{
              flex: 1,
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {fileName.replace('pages/', '') + (hasChanges ? '*' : '')}
          </span>
        </Tooltip>
      </div>
      <Button
        disabled={disabled}
        id="edit-button"
        type="ghost-destructive"
        icon="Edit"
        size="small"
        style={{ alignSelf: 'flex-end' }}
        onClick={onEditFilename}
        aria-label="Edit Name"
      />
      <Button
        disabled={disabled}
        id="delete-button"
        type="ghost-destructive"
        icon="Delete"
        size="small"
        style={{ alignSelf: 'flex-end' }}
        onClick={onDelete}
        aria-label="Delete"
      />
    </ListItem>
  );
};

const ListItem = styled(Flex)<{ $active?: boolean }>`
  padding: 4px 8px;
  border-radius: 8px;
  width: 100%;
  cursor: pointer;
  transition: 0.3s all;
  background: ${(props) => (props.$active ? '#fff' : 'inherit')};
  color: ${(props) =>
    props.$active ? 'var(--cogs-surface--action--strong--default)' : 'inherit'};

  #delete-button,
  #edit-button {
    transition: 0.3s all;
    opacity: 0;
  }

  &&:hover {
    background: #fff;
    #delete-button,
    #edit-button {
      opacity: 1;
    }
  }
`;
