/* eslint-disable no-param-reassign */

import React, { useState } from 'react';
import {
  SvgDocument,
  SvgPath,
  DiagramSymbol,
  DiagramLineInstance,
  DiagramSymbolInstance,
  SvgRepresentation,
  getInternalSvgBoundingBox,
  DiagramConnection,
  DiagramInstanceId,
  getNoneOverlappingSymbolInstances,
} from '@cognite/pid-tools';

import { loadSymbolsFromJson, saveInstancesAsJson } from './utils/jsonUtils';
import { ToolType, ExistingSymbolPromptData } from './types';
import { ReactPidWrapper, ReactPidLayout } from './elements';
import { SidePanel } from './components';
import { SvgViewer } from './components/svg-viewer/SvgViewer';
import { Viewport } from './components/viewport/Viewport';
import { SaveSymbolModals } from './components/save-symbol-modals/SaveSymbolModals';
import { deleteSymbolFromState, getSymbolByName } from './utils/symbolUtils';

let svgDocument: SvgDocument | undefined;
const setSvgDocument = (svgDoc: SvgDocument) => {
  svgDocument = svgDoc;
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

  const [connections, setConnections] = React.useState<DiagramConnection[]>([]);
  const [connectionSelection, setConnectionSelection] =
    React.useState<DiagramInstanceId | null>(null);

  const setToolBarMode = (mode: ToolType) => {
    setSelection([]);
    setConnectionSelection(null);
    setActive(mode);
  };

  const loadSymbolsAsJson = (jsonData: any) => {
    if (svgDocument === undefined) {
      return;
    }

    loadSymbolsFromJson(
      jsonData,
      setSymbols,
      symbols,
      svgDocument,
      setSymbolInstances,
      symbolInstances,
      setLines,
      lines,
      setConnections,
      connections
    );
  };

  const saveGraphAsJson = () => {
    if (svgDocument === undefined) {
      return;
    }

    saveInstancesAsJson(
      svgDocument,
      symbols,
      lines,
      symbolInstances,
      connections
    );
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

  const createSvgRepresentation = (pathIds: string[]) => {
    const newSvgRepresentation = {} as SvgRepresentation;

    const internalSvgPaths = pathIds.map((pathId) =>
      svgDocument?.getInternalPathById(pathId)
    );

    newSvgRepresentation.boundingBox =
      getInternalSvgBoundingBox(internalSvgPaths);

    newSvgRepresentation.svgPaths = internalSvgPaths.map(
      (internalSvgPath) =>
        ({
          svgCommands: internalSvgPath?.serializeToPathCommands(),
        } as SvgPath)
    );
    return newSvgRepresentation;
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

  const saveSymbol = (symbolName: string, selection: SVGElement[]) => {
    if (svgDocument === undefined) {
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
    const newSvgRepresentation = createSvgRepresentation(pathIds);
    const newSymbol = setOrUpdateSymbol(symbolName, newSvgRepresentation);

    setSelection([]);

    const newSymbolInstances = svgDocument.findAllInstancesOfSymbol(newSymbol);
    const prunedInstances = getNoneOverlappingSymbolInstances(
      svgDocument,
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
          fileUrl={fileUrl}
          saveGraphAsJson={saveGraphAsJson}
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
              lines={lines}
              setLines={setLines}
              selection={selection}
              setSelection={setSelection}
              connectionSelection={connectionSelection}
              setConnectionSelection={setConnectionSelection}
              connections={connections}
              setConnections={setConnections}
              svgDocument={svgDocument}
              setSvgDocument={setSvgDocument}
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
