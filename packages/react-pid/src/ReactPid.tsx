/* eslint-disable no-param-reassign */

import React, { useState } from 'react';
import {
  PidDocument,
  DiagramSymbol,
  DiagramLineInstance,
  DiagramSymbolInstance,
  SvgRepresentation,
  DiagramConnection,
  DiagramInstanceId,
  getNoneOverlappingSymbolInstances,
} from '@cognite/pid-tools';

import { loadSymbolsFromJson, saveGraphAsJson } from './utils/jsonUtils';
import { ToolType, ExistingSymbolPromptData } from './types';
import { ReactPidWrapper, ReactPidLayout } from './elements';
import { SidePanel } from './components';
import { SvgViewer } from './components/svg-viewer/SvgViewer';
import { Viewport } from './components/viewport/Viewport';
import { SaveSymbolModals } from './components/save-symbol-modals/SaveSymbolModals';
import {
  deleteConnectionFromState,
  deleteSymbolFromState,
  getSymbolByName,
} from './utils/symbolUtils';

let pidDocument: PidDocument | undefined;
const setPidDocument = (pidDoc: PidDocument) => {
  pidDocument = pidDoc;
};

export const ReactPid: React.FC = () => {
  const [fileUrl, setFileUrl] = useState<string>('');
  const [active, setActive] = useState<ToolType>('addSymbol');

  const [selection, setSelection] = useState<SVGElement[]>([]);
  const [lines, setLines] = useState<DiagramLineInstance[]>([]);
  const [symbols, setSymbols] = useState<DiagramSymbol[]>([]);
  const [symbolInstances, setSymbolInstances] = useState<
    DiagramSymbolInstance[]
  >([]);
  const [existingSymbolPromptData, setExistingSymbolPromptData] =
    useState<ExistingSymbolPromptData | null>(null);

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
      connections
    );
  };

  const saveGraphAsJsonWrapper = () => {
    if (pidDocument === undefined) return;
    saveGraphAsJson(pidDocument, symbols, lines, symbolInstances, connections);
  };

  const findLinesAndConnections = () => {
    if (pidDocument === undefined) return;

    const { lineInstances, newConnections } =
      pidDocument.findLinesAndConnection(symbolInstances, lines, connections);

    setLines([...lines, ...lineInstances]);
    setConnections(newConnections);
  };
  const shouldShowPrompt = (symbolName: string) => {
    const symbolExist = getSymbolByName(symbols, symbolName) !== undefined;
    return symbolExist && existingSymbolPromptData?.resolution !== 'add';
  };

  const setOrUpdateSymbol = (
    symbolName: string,
    svgRepresentation: SvgRepresentation
  ) => {
    let diagramSymbol = getSymbolByName(symbols, symbolName);
    if (diagramSymbol === undefined) {
      diagramSymbol = {
        symbolName,
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

  const saveSymbol = (symbolName: string, selection: SVGElement[]) => {
    if (pidDocument === undefined) {
      return;
    }

    const showPrompt = shouldShowPrompt(symbolName);
    if (showPrompt) {
      setExistingSymbolPromptData({
        symbolName,
        svgElements: selection,
      });
      return;
    }

    const pathIds = selection.map((svgElement) => svgElement.id);
    const newSvgRepresentation = pidDocument.createSvgRepresentation(
      pathIds,
      false
    );
    const newSymbol = setOrUpdateSymbol(symbolName, newSvgRepresentation);

    setSelection([]);

    const newSymbolInstances = pidDocument.findAllInstancesOfSymbol(newSymbol);
    const prunedInstances = getNoneOverlappingSymbolInstances(
      pidDocument,
      symbolInstances,
      newSymbolInstances
    );
    setSymbolInstances(prunedInstances);
    setExistingSymbolPromptData(null);
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
            />
          )}
        </Viewport>
      </ReactPidLayout>
      {existingSymbolPromptData && (
        <SaveSymbolModals
          symbolName={existingSymbolPromptData.symbolName}
          onSymbolNameChange={(symbolName) =>
            setExistingSymbolPromptData({
              ...existingSymbolPromptData,
              symbolName,
            })
          }
          resolution={existingSymbolPromptData.resolution}
          onResolutionChange={(resolution) =>
            setExistingSymbolPromptData({
              ...existingSymbolPromptData,
              resolution,
            })
          }
          svgElements={existingSymbolPromptData.svgElements}
          onCancel={() => setExistingSymbolPromptData(null)}
          saveSymbol={saveSymbol}
        />
      )}
    </ReactPidWrapper>
  );
};
