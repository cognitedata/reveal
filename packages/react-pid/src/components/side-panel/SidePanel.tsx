import styled from 'styled-components';
import { Button, ToolBarButton } from '@cognite/cogs.js';
import {
  DiagramConnection,
  DiagramEquipmentTagInstance,
  DiagramLineInstance,
  DiagramSymbol,
  DiagramSymbolInstance,
  DocumentMetadata,
  DocumentType,
  GraphDocument,
  PidDocumentWithDom,
} from '@cognite/pid-tools';

import { ToolType } from '../../types';
import { SaveSymbolData } from '../../ReactPid';

import { CollapsableInstanceList } from './CollapsableInstanceList';
import { FileController } from './FileController';
import { AddSymbolController } from './AddSymbolController';
import { DocumentTypeSelector } from './DocumentTypeSelector';
import { AddLineNumberController } from './AddLineNumberController';
import { DocumentInfo } from './DocumentInfo';

const SidePanelWrapper = styled.div`
  display: grid;
  grid-template-rows: max-content max-content auto max-content;
  height: 100%;
  position: relative;
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
  getPidDocument: () => PidDocumentWithDom | undefined;
  active: ToolType;
  symbols: DiagramSymbol[];
  lines: DiagramLineInstance[];
  symbolInstances: DiagramSymbolInstance[];
  selection: SVGElement[];
  setActive: (arg0: ToolType) => void;
  loadSymbolsAsJson: (json: GraphDocument) => void;
  saveSymbol: (options: SaveSymbolData, selection: SVGElement[]) => void;
  deleteSymbol: (symbol: DiagramSymbol) => void;
  deleteConnection: (connection: DiagramConnection) => void;
  connections: DiagramConnection[];
  fileUrl?: string;
  autoAnalysis: () => void;
  saveGraphAsJson: () => void;
  documentMetadata: DocumentMetadata;
  setDocumentType: (type: DocumentType) => void;
  lineNumbers: number[];
  setLineNumbers: (arg: number[]) => void;
  activeLineNumber: number | null;
  setActiveLineNumber: (arg: number | null) => void;
  equipmentTags: DiagramEquipmentTagInstance[];
  setEquipmentTags: (arg: DiagramEquipmentTagInstance[]) => void;
  activeTagId: string | null;
  setActiveTagId: (arg: string | null) => void;
  splitLines: () => void;
  hideSelection: boolean;
  setHideSelection: (arg: boolean) => void;
  setSelection: (arg: SVGElement[]) => void;
  jsonInputRef: (node: HTMLInputElement | null) => void;
  onUploadJsonClick: () => void;
}

export const SidePanel = ({
  getPidDocument,
  active,
  symbols,
  lines,
  symbolInstances,
  selection,
  setActive,
  loadSymbolsAsJson,
  saveSymbol,
  deleteSymbol,
  deleteConnection,
  connections,
  fileUrl,
  autoAnalysis,
  saveGraphAsJson,
  documentMetadata,
  setDocumentType,
  lineNumbers,
  setLineNumbers,
  activeLineNumber,
  setActiveLineNumber,
  equipmentTags,
  setEquipmentTags,
  activeTagId,
  setActiveTagId,
  splitLines,
  hideSelection,
  setHideSelection,
  setSelection,
  jsonInputRef,
  onUploadJsonClick,
}: SidePanelProps) => {
  const toolBarButtonGroups: ToolBarButton[][] = [
    [
      {
        icon: 'Add',
        onClick: () => setActive('addSymbol'),
        className: `${active === 'addSymbol' && 'active'}`,
        description: 'Add symbol',
      },
      {
        icon: 'VectorLine',
        onClick: () => setActive('addLine'),
        className: `${active === 'addLine' && 'active'}`,
        description: 'Add line',
      },
      {
        icon: 'Split',
        onClick: () => setActive('connectInstances'),
        className: `${active === 'connectInstances' && 'active'}`,
        description: 'Connect instances',
      },
      {
        icon: 'Flag',
        onClick: () => setActive('connectLabels'),
        className: `${active === 'connectLabels' && 'active'}`,
        description: 'Connect labels',
      },
      {
        icon: 'GraphTree',
        onClick: () => setActive('graphExplorer'),
        className: `${active === 'graphExplorer' && 'active'}`,
        description: 'Explore the wast graph universe',
      },
      {
        icon: 'Number',
        onClick: () => setActive('setLineNumber'),
        className: `${active === 'setLineNumber' && 'active'}`,
        description: 'Set line number',
      },
      {
        icon: 'String',
        onClick: () => setActive('addEquipmentTag'),
        className: `${active === 'addEquipmentTag' && 'active'}`,
        description: 'Add equipment tag',
      },
    ],
  ];

  if (documentMetadata.type === DocumentType.pid) {
    toolBarButtonGroups[0].push({
      icon: 'Slice',
      onClick: () => setActive('splitLine'),
      className: `${active === 'splitLine' && 'active'}`,
      description: 'Split line',
    });
  }

  const setActiveTagWrapper = (arg: string | null) => {
    setActive('addEquipmentTag');
    setActiveTagId(arg);
  };

  return (
    <SidePanelWrapper>
      <FileControllerWrapper>
        <FileController
          disabled={fileUrl === ''}
          symbols={symbols}
          symbolInstances={symbolInstances}
          lineInstances={lines}
          loadSymbolsAsJson={loadSymbolsAsJson}
          saveGraphAsJson={saveGraphAsJson}
          getPidDocument={getPidDocument}
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
        documentType={documentMetadata.type}
      />

      {documentMetadata.type === DocumentType.pid && (
        <Button onClick={splitLines}>Split Lines</Button>
      )}

      <Button onClick={autoAnalysis}>Auto Analysis</Button>

      <div>
        {active === 'addSymbol' && (
          <AddSymbolController
            selection={selection}
            saveSymbol={saveSymbol}
            hideSelection={hideSelection}
            toggleHideSelection={() => setHideSelection(!hideSelection)}
            clearSelection={() => setSelection([])}
            documentType={documentMetadata.type}
          />
        )}
        {active === 'setLineNumber' && (
          <AddLineNumberController
            lineNumbers={lineNumbers}
            setLineNumbers={setLineNumbers}
            activeLineNumber={activeLineNumber}
            setActiveLineNumber={setActiveLineNumber}
          />
        )}
      </div>
      {active === 'selectDocumentType' && fileUrl !== '' && (
        <DocumentTypeSelector setDocumentType={setDocumentType} />
      )}
    </SidePanelWrapper>
  );
};
