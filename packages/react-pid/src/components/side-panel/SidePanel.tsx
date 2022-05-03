import styled from 'styled-components';
import { Button, ToolBarButton } from '@cognite/cogs.js';
import {
  DiagramConnection,
  DiagramEquipmentTagInstance,
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
  DocumentMetadata,
  DiagramType,
  ToolType,
  PathReplacementGroup,
  AddSymbolData,
} from '@cognite/pid-tools';

import { CollapsableInstanceList } from './CollapsableInstanceList';
import { FileController } from './FileController';
import { AddSymbolController } from './AddSymbolController';
import { DiagramTypeSelector } from './DiagramTypeSelector';
import { AddLineNumberController } from './AddLineNumberController';
import { DocumentInfo } from './DocumentInfo';

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
  symbolSelection: string[];
  loadJson: (json: Record<string, unknown>) => void;
  addSymbolFromSymbolSelection: (options: AddSymbolData) => void;
  deleteSymbol: (symbol: DiagramSymbol) => void;
  deleteConnection: (connection: DiagramConnection) => void;
  connections: DiagramConnection[];
  file: File | null;
  autoAnalysis: () => void;
  saveGraphAsJson: () => void;
  documentMetadata: DocumentMetadata;
  setDiagramType: (type: DiagramType) => void;
  lineNumbers: string[];
  setLineNumbers: (arg: string[]) => void;
  activeLineNumber: string | null;
  setActiveLineNumber: (arg: string | null) => void;
  equipmentTags: DiagramEquipmentTagInstance[];
  setEquipmentTags: (arg: DiagramEquipmentTagInstance[]) => void;
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
  symbolSelection,
  loadJson,
  addSymbolFromSymbolSelection,
  deleteSymbol,
  deleteConnection,
  connections,
  file,
  autoAnalysis,
  saveGraphAsJson,
  documentMetadata,
  setDiagramType,
  lineNumbers,
  setLineNumbers,
  activeLineNumber,
  setActiveLineNumber,
  equipmentTags,
  setEquipmentTags,
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
  const toolBarButtonGroups: ToolBarButton[][] = [
    [
      {
        icon: 'Add',
        onClick: () => setActiveTool('addSymbol'),
        className: `${activeTool === 'addSymbol' && 'active'}`,
        description: 'Add symbol',
      },
      {
        icon: 'VectorLine',
        onClick: () => setActiveTool('addLine'),
        className: `${activeTool === 'addLine' && 'active'}`,
        description: 'Add line',
      },
      {
        icon: 'Split',
        onClick: () => setActiveTool('connectInstances'),
        className: `${activeTool === 'connectInstances' && 'active'}`,
        description: 'Connect instances',
      },
      {
        icon: 'Flag',
        onClick: () => setActiveTool('connectLabels'),
        className: `${activeTool === 'connectLabels' && 'active'}`,
        description: 'Connect labels',
      },
      {
        icon: 'Number',
        onClick: () => setActiveTool('setLineNumber'),
        className: `${activeTool === 'setLineNumber' && 'active'}`,
        description: 'Set line number',
      },
      {
        icon: 'String',
        onClick: () => setActiveTool('addEquipmentTag'),
        className: `${activeTool === 'addEquipmentTag' && 'active'}`,
        description: 'Add equipment tag',
      },
    ],
  ];

  if (documentMetadata.type === DiagramType.pid) {
    toolBarButtonGroups[0].push({
      icon: 'Slice',
      onClick: () => setActiveTool('splitLine'),
      className: `${activeTool === 'splitLine' && 'active'}`,
      description: 'Split line',
    });
  }

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
        equipmentTags={equipmentTags}
        setEquipmentTags={setEquipmentTags}
        activeTagId={activeTagId}
        setActiveTagId={setActiveTagWrapper}
        diagramType={documentMetadata.type}
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
      </div>
      {activeTool === 'selectDiagramType' && file !== null && (
        <DiagramTypeSelector setDiagramType={setDiagramType} />
      )}
    </SidePanelWrapper>
  );
};
