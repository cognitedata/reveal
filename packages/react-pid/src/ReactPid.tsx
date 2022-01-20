/* eslint-disable no-param-reassign */

import React, { useEffect, useState } from 'react';
import {
  DiagramSymbol,
  DiagramLineInstance,
  SvgRepresentation,
  DiagramConnection,
  DiagramInstanceId,
  getNoneOverlappingSymbolInstances,
  PathReplacement,
  DiagramSymbolInstance,
  pruneSymbolOverlappingPathsFromLines,
  DocumentType,
  PidDocumentWithDom,
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

export interface SaveSymbolData {
  symbolType: string;
  description: string;
}

export const ReactPid: React.FC = () => {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [active, setActive] = useState<ToolType>('selectDocumentType');

  const [selection, setSelection] = useState<SVGElement[]>([]);
  const [lines, setLines] = useState<DiagramLineInstance[]>([]);

  const [splitSelection, setSplitSelection] = React.useState<string | null>(
    null
  );
  const [pathReplacements, setPathReplacements] = useState<PathReplacement[]>(
    []
  );

  const [lineNumbers, setLineNumbers] = useState<string[]>([]);
  const [activeLineNumber, setActiveLineNumber] = useState<string | null>(null);
  const [symbols, setSymbols] = useState<DiagramSymbol[]>([]);
  const [symbolInstances, setSymbolInstances] = useState<
    DiagramSymbolInstance[]
  >([]);
  const [documentType, setDocumentType] = useState<DocumentType>(
    DocumentType.unknown
  );

  const [labelSelection, setLabelSelection] =
    useState<DiagramInstanceId | null>(null);

  const [connections, setConnections] = React.useState<DiagramConnection[]>([]);
  const [connectionSelection, setConnectionSelection] =
    React.useState<DiagramInstanceId | null>(null);

  let pidDocument: PidDocumentWithDom | undefined;
  const setPidDocument = (arg: PidDocumentWithDom) => {
    pidDocument = arg;
  };
  const getPidDocument = () => pidDocument;

  useEffect(() => {
    if (documentType !== DocumentType.unknown) {
      setActive('addSymbol');
    }
  }, [documentType]);

  const setToolBarMode = (mode: ToolType) => {
    setSelection([]);
    setSplitSelection(null);
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
      pathReplacements,
      setPathReplacements,
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
      pathReplacements,
      documentType,
      lineNumbers
    );
  };

  const findLinesAndConnections = () => {
    if (pidDocument === undefined) return;

    const { lineInstances, newConnections } =
      pidDocument.findLinesAndConnection(
        documentType,
        symbolInstances,
        lines,
        connections
      );

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

  const evalFileName = (file: File) => {
    const looksLikeIso = file.name.match(/L[0-9]{1,}/);
    const looksLikePid = file.name.match(/MF/);

    if (looksLikePid && !looksLikeIso) {
      setDocumentType(DocumentType.pid);
    } else if (looksLikeIso && !looksLikePid) {
      setDocumentType(DocumentType.isometric);
    }
  };

  const handleFileChange = ({
    target,
  }: React.ChangeEvent<HTMLInputElement>) => {
    if (target && target.files?.length) {
      const file = target.files[0];
      setFileUrl(URL.createObjectURL(file));
      evalFileName(file);
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
          documentType={documentType}
          setDocumentType={setDocumentType}
          lineNumbers={lineNumbers}
          setLineNumbers={setLineNumbers}
          activeLineNumber={activeLineNumber}
          setActiveLineNumber={setActiveLineNumber}
          getPidDocument={getPidDocument}
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
              splitSelection={splitSelection}
              setSplitSelection={setSplitSelection}
              pathReplacements={pathReplacements}
              setPathReplacements={setPathReplacements}
              connectionSelection={connectionSelection}
              setConnectionSelection={setConnectionSelection}
              connections={connections}
              setConnections={setConnections}
              setPidDocument={setPidDocument}
              getPidDocument={getPidDocument}
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
