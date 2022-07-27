import styled from 'styled-components';
import { Button } from '@cognite/cogs.js';
import {
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
  DocumentMetadata,
  ToolType,
  PathReplacementGroup,
  AddSymbolData,
  DiagramTag,
  DiagramInstanceId,
} from '@cognite/pid-tools';

import { CollapsableInstanceList } from './CollapsableInstanceList';
import { FileController } from './FileController';
import { AddSymbolController } from './AddSymbolController';
import { AddLineNumberController } from './AddLineNumberController';
import { DocumentInfo } from './DocumentInfo';
import { AddAssetController } from './AddAssetController';

const SidePanelWrapper = styled.div`
  display: grid;
  grid-template-rows: max-content max-content auto max-content;
  position: relative;
  overflow: auto;
`;

const FileControllerWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  & > span {
    margin: 0 auto;
  }
`;

interface SidePanelProps {
  activeTool: ToolType;
  setActiveTool: (arg0: ToolType) => void;
  symbols: DiagramSymbol[];
  lines: DiagramLineInstance[];
  symbolInstances: DiagramSymbolInstance[];
  setSymbolInstances: (arg: DiagramSymbolInstance[]) => void;
  symbolSelection: string[];
  labelSelection: DiagramInstanceId | null;
  loadJson: (json: Record<string, unknown>) => void;
  addSymbolFromSymbolSelection: (options: AddSymbolData) => void;
  deleteSymbol: (symbol: DiagramSymbol) => void;
  deleteConnection: (connection: DiagramConnection) => void;
  connections: DiagramConnection[];
  file: File | null;
  autoAnalysis: () => void;
  saveGraphAsJson: () => void;
  documentMetadata: DocumentMetadata;
  lineNumbers: string[];
  setLineNumbers: (arg: string[]) => void;
  activeLineNumber: string | null;
  setActiveLineNumber: (arg: string | null) => void;
  tags: DiagramTag[];
  setTags: (arg: DiagramTag[]) => void;
  activeTagId: string | null;
  setActiveTagId: (arg: string | null) => void;
  hideSelection: boolean;
  toggleHideSelection: () => void;
  clearSymbolSelection: () => void;
  jsonInputRef: (node: HTMLInputElement | null) => void;
  onUploadJsonClick: () => void;
  pathReplacementGroups: PathReplacementGroup[];
  deletePathReplacementGroups: (
    pathReplacementGroupIds: string[] | string
  ) => void;
}

export const SidePanel = ({
  activeTool,
  setActiveTool,
  symbols,
  lines,
  symbolInstances,
  setSymbolInstances,
  symbolSelection,
  labelSelection,
  loadJson,
  addSymbolFromSymbolSelection,
  deleteSymbol,
  deleteConnection,
  connections,
  file,
  autoAnalysis,
  saveGraphAsJson,
  documentMetadata,
  lineNumbers,
  setLineNumbers,
  activeLineNumber,
  setActiveLineNumber,
  tags,
  setTags,
  activeTagId,
  setActiveTagId,
  hideSelection,
  toggleHideSelection,
  clearSymbolSelection,
  jsonInputRef,
  onUploadJsonClick,
  pathReplacementGroups,
  deletePathReplacementGroups,
}: SidePanelProps) => {
  const setActiveTagWrapper = (arg: string | null) => {
    setActiveTool('addEquipmentTag');
    setActiveTagId(arg);
  };

  return (
    <SidePanelWrapper>
      <FileControllerWrapper>
        <FileController
          disabled={file === null}
          symbols={symbols}
          loadJson={loadJson}
          saveGraphAsJson={saveGraphAsJson}
          jsonInputRef={jsonInputRef}
          onUploadJsonClick={onUploadJsonClick}
        />
      </FileControllerWrapper>
      <DocumentInfo documentMetadata={documentMetadata} />
      <CollapsableInstanceList
        symbols={symbols}
        symbolInstances={symbolInstances}
        lineInstances={lines}
        deleteSymbol={deleteSymbol}
        deleteConnection={deleteConnection}
        connections={connections}
        tags={tags}
        setTags={setTags}
        activeTagId={activeTagId}
        setActiveTagId={setActiveTagWrapper}
        pathReplacementGroups={pathReplacementGroups}
        deletePathReplacementGroups={deletePathReplacementGroups}
      />

      <Button onClick={autoAnalysis}>Auto Analysis</Button>

      <div>
        {activeTool === 'addSymbol' && (
          <AddSymbolController
            symbolSelection={symbolSelection}
            clearSymbolSelection={clearSymbolSelection}
            addSymbolFromSymbolSelection={addSymbolFromSymbolSelection}
            hideSelection={hideSelection}
            toggleHideSelection={toggleHideSelection}
            diagramType={documentMetadata.type}
          />
        )}
        {activeTool === 'setLineNumber' && (
          <AddLineNumberController
            lineNumbers={lineNumbers}
            setLineNumbers={setLineNumbers}
            activeLineNumber={activeLineNumber}
            setActiveLineNumber={setActiveLineNumber}
          />
        )}
        {activeTool === 'connectLabels' && (
          <AddAssetController
            documentMetadata={documentMetadata}
            symbolInstances={symbolInstances}
            setSymbolInstances={setSymbolInstances}
            labelSelection={labelSelection}
          />
        )}
      </div>
    </SidePanelWrapper>
  );
};
