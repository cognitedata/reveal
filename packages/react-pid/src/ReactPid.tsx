/* eslint-disable no-param-reassign */

import React, { useState } from 'react';
import {
  PidDocument,
  DiagramSymbol,
  DiagramLineInstance,
  SvgRepresentation,
  DiagramConnection,
  DiagramInstanceId,
  getNoneOverlappingSymbolInstances,
  DiagramSymbolInstance,
  pruneSymbolOverlappingPathsFromLines,
} from '@cognite/pid-tools';
import { v4 as uuid } from 'uuid';

import { loadSymbolsFromJson, saveGraphAsJson } from './utils/jsonUtils';
import { ToolType } from './types';
import { ReactPidWrapper, ReactPidLayout } from './elements';
import { SidePanel } from './components';
import { SvgViewer } from './components/svg-viewer/SvgViewer';
import { Viewport } from './components/viewport/Viewport';
import {
  deleteConnectionFromState,
  deleteConnectionsUsingDeletedLinesFromState,
  deleteSymbolFromState,
  getSymbolByTypeAndDescription,
} from './utils/symbolUtils';

let pidDocument: PidDocument | undefined;
const setPidDocument = (pidDoc: PidDocument) => {
  pidDocument = pidDoc;
};

export interface SaveSymbolData {
  symbolType: string;
  description: string;
}

export const ReactPid: React.FC = () => {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [active, setActive] = useState<ToolType>('addSymbol');

  const [selection, setSelection] = useState<SVGElement[]>([]);
  const [lines, setLines] = useState<DiagramLineInstance[]>([]);
  const [lineNumbers, setLineNumbers] = useState<string[]>([]);
  const [activeLineNumber, setActiveLineNumber] = useState<string | null>(null);
  const [symbols, setSymbols] = useState<DiagramSymbol[]>([]);
  const [symbolInstances, setSymbolInstances] = useState<
    DiagramSymbolInstance[]
  >([]);

  const [labelSelection, setLabelSelection] =
    useState<DiagramInstanceId | null>(null);

  const [connections, setConnections] = React.useState<DiagramConnection[]>([]);
  const [connectionSelection, setConnectionSelection] =
    React.useState<DiagramInstanceId | null>(null);

  const setToolBarMode = (mode: ToolType) => {
    setSelection([]);
    setConnectionSelection(null);
    setLabelSelection(null);
    setActive(mode);
  };

  const loadSymbolsAsJson = (jsonData: any) => {
    if (pidDocument === undefined) {
      return;
    }

    loadSymbolsFromJson(
      jsonData,
      setSymbols,
      symbols,
      pidDocument,
      setSymbolInstances,
      symbolInstances,
      setLines,
      lines,
      setConnections,
      connections,
      lineNumbers,
      setLineNumbers
    );
  };

  const saveGraphAsJsonWrapper = () => {
    if (pidDocument === undefined) return;
    saveGraphAsJson(
      pidDocument,
      symbols,
      lines,
      symbolInstances,
      connections,
      lineNumbers
    );
  };

  const findLinesAndConnections = () => {
    if (pidDocument === undefined) return;

    const { lineInstances, newConnections } =
      pidDocument.findLinesAndConnection(symbolInstances, lines, connections);

    setLines([...lines, ...lineInstances]);
    setConnections(newConnections);
  };

  const setOrUpdateSymbol = (
    symbolData: SaveSymbolData,
    svgRepresentation: SvgRepresentation
  ) => {
    const { symbolType, description } = symbolData;

    let diagramSymbol = getSymbolByTypeAndDescription(
      symbols,
      symbolType,
      description
    );

    if (diagramSymbol === undefined) {
      diagramSymbol = {
        id: uuid(),
        symbolType,
        description,
        svgRepresentations: [svgRepresentation],
      } as DiagramSymbol;

      setSymbols([...symbols, diagramSymbol]);
    } else {
      diagramSymbol.svgRepresentations.push(svgRepresentation);
    }
    return diagramSymbol;
  };

  const deleteSymbol = (diagramSymbol: DiagramSymbol) => {
    deleteSymbolFromState(
      diagramSymbol,
      symbolInstances,
      connections,
      setConnections,
      setSymbolInstances,
      setSymbols,
      symbols
    );
  };

  const deleteConnection = (diagramConnection: DiagramConnection) => {
    deleteConnectionFromState(diagramConnection, connections, setConnections);
  };

  const saveSymbol = (symbolData: SaveSymbolData, selection: SVGElement[]) => {
    if (pidDocument === undefined) {
      return;
    }

    const pathIds = selection.map((svgElement) => svgElement.id);
    const newSvgRepresentation = pidDocument.createSvgRepresentation(
      pathIds,
      false
    );
    const newSymbol = setOrUpdateSymbol(symbolData, newSvgRepresentation);

    setSelection([]);

    const newSymbolInstances = pidDocument.findAllInstancesOfSymbol(newSymbol);
    const prunedInstances = getNoneOverlappingSymbolInstances(
      pidDocument,
      symbolInstances,
      newSymbolInstances
    );

    const { prunedLines, linesToDelete } = pruneSymbolOverlappingPathsFromLines(
      lines,
      newSymbolInstances
    );

    deleteConnectionsUsingDeletedLinesFromState(
      linesToDelete,
      connections,
      setConnections
    );

    setLines(prunedLines);

    setSymbolInstances(prunedInstances);
  };

  const handleFileChange = ({ target }: any) => {
    if (target && target.files.length > 0) {
      setFileUrl(URL.createObjectURL(target.files[0]));
      return;
    }
    setFileUrl('');
  };

  return (
    <ReactPidWrapper>
      <ReactPidLayout>
        <SidePanel
          active={active}
          symbols={symbols}
          lines={lines}
          symbolInstances={symbolInstances}
          selection={selection}
          setActive={setToolBarMode}
          loadSymbolsAsJson={loadSymbolsAsJson}
          saveSymbol={saveSymbol}
          connections={connections}
          deleteSymbol={deleteSymbol}
          deleteConnection={deleteConnection}
          fileUrl={fileUrl}
          findLinesAndConnections={findLinesAndConnections}
          saveGraphAsJson={saveGraphAsJsonWrapper}
          lineNumbers={lineNumbers}
          setLineNumbers={setLineNumbers}
          activeLineNumber={activeLineNumber}
          setActiveLineNumber={setActiveLineNumber}
        />
        <Viewport>
          {fileUrl === '' ? (
            <input
              type="file"
              accept=".svg"
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              onChange={handleFileChange}
            />
          ) : (
            <SvgViewer
              fileUrl={fileUrl}
              active={active}
              symbolInstances={symbolInstances}
              setSymbolInstances={setSymbolInstances}
              lines={lines}
              setLines={setLines}
              selection={selection}
              setSelection={setSelection}
              connectionSelection={connectionSelection}
              setConnectionSelection={setConnectionSelection}
              connections={connections}
              setConnections={setConnections}
              pidDocument={pidDocument}
              setPidDocument={setPidDocument}
              labelSelection={labelSelection}
              setLabelSelection={setLabelSelection}
              activeLineNumber={activeLineNumber}
            />
          )}
        </Viewport>
      </ReactPidLayout>
    </ReactPidWrapper>
  );
};
