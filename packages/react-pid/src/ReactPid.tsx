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
  DiagramEquipmentTagInstance,
  DocumentType,
  PidDocumentWithDom,
  getDiagramInstanceId,
  addOrRemoveLabelToInstance,
  DocumentMetadata,
  PidDocumentMetadata,
  IsoDocumentMetadata,
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
  const [equipmentTags, setEquipmentTags] = useState<
    DiagramEquipmentTagInstance[]
  >([]);
  const [activeTagName, setActiveTagName] = useState<string>();
  const [symbolInstances, setSymbolInstances] = useState<
    DiagramSymbolInstance[]
  >([]);
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata>({
    type: DocumentType.unknown,
    name: 'Unknown',
    unit: 'Unknown',
  });

  const [labelSelection, setLabelSelection] =
    useState<DiagramInstanceId | null>(null);

  const [connections, setConnections] = useState<DiagramConnection[]>([]);
  const [connectionSelection, setConnectionSelection] =
    useState<DiagramInstanceId | null>(null);

  let pidDocument: PidDocumentWithDom | undefined;
  const setPidDocument = (arg: PidDocumentWithDom) => {
    pidDocument = arg;
  };
  const getPidDocument = () => pidDocument;

  const setDocumentType = (documentType: DocumentType) => {
    if (documentType === DocumentType.pid) {
      setDocumentMetadata({
        type: DocumentType.pid,
        documentNumber: -1,
        unit: 'Unknown',
      } as PidDocumentMetadata);
    } else if (documentType === DocumentType.isometric) {
      setDocumentMetadata({
        type: DocumentType.isometric,
        lineNumber: 'Unknown',
        unit: 'Unknown',
      } as IsoDocumentMetadata);
    }
  };

  useEffect(() => {
    if (
      documentMetadata.type !== DocumentType.unknown &&
      active === 'selectDocumentType'
    ) {
      setActive('addSymbol');
    }
  }, [documentMetadata]);

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
      setLineNumbers,
      equipmentTags,
      setEquipmentTags
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
      documentMetadata,
      lineNumbers,
      equipmentTags
    );
  };

  const autoAnalysis = () => {
    if (pidDocument === undefined) return;

    // find lines and connections
    const { lineInstances, newConnections } =
      pidDocument.findLinesAndConnection(
        documentMetadata.type,
        symbolInstances,
        lines,
        connections
      );

    setLines([...lines, ...lineInstances]);
    setConnections(newConnections);

    // connect labels to symbol instances
    const pidLabelSymbolInstanceConnection =
      pidDocument.connectLabelsToSymbolInstances(symbolInstances);
    if (pidLabelSymbolInstanceConnection.length > 0) {
      setSymbolInstances(
        symbolInstances.map((symbolInstance) => {
          pidLabelSymbolInstanceConnection.forEach((labelSymbolConnection) => {
            if (
              getDiagramInstanceId(symbolInstance) ===
              labelSymbolConnection.instanceId
            ) {
              addOrRemoveLabelToInstance(
                labelSymbolConnection.labelId,
                labelSymbolConnection.labelText,
                symbolInstance
              );
            }
          });
          return symbolInstance;
        })
      );
    }
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
    const looksLikeIso = file.name.match(/L[0-9]{1,}-[0-9]/);
    const looksLikePid = file.name.match(/MF_[0-9]{1,}/);

    const unit = file.name.match(/G[0-9]{4}/);
    const { name } = file;

    if (looksLikePid && !looksLikeIso) {
      const documentNumber = parseInt(looksLikePid[0].substring(3), 10);
      setDocumentMetadata({
        type: DocumentType.pid,
        name,
        unit: unit ? unit[0] : 'Unknown',
        documentNumber,
      } as PidDocumentMetadata);
    } else if (looksLikeIso && !looksLikePid) {
      const lineNumber = looksLikeIso[0];
      setDocumentMetadata({
        type: DocumentType.isometric,
        name,
        unit: unit ? unit[0] : 'Unknown',
        lineNumber,
      } as IsoDocumentMetadata);
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

  useEffect(() => {
    if (active !== 'addEquipmentTag' && activeTagName !== undefined) {
      setActiveTagName(undefined);
    }
  }, [active]);

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
          autoAnalysis={autoAnalysis}
          saveGraphAsJson={saveGraphAsJsonWrapper}
          documentMetadata={documentMetadata}
          setDocumentType={setDocumentType}
          lineNumbers={lineNumbers}
          setLineNumbers={setLineNumbers}
          activeLineNumber={activeLineNumber}
          setActiveLineNumber={setActiveLineNumber}
          equipmentTags={equipmentTags}
          setEquipmentTags={setEquipmentTags}
          activeTagName={activeTagName}
          setActiveTagName={setActiveTagName}
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
              equipmentTags={equipmentTags}
              setEquipmentTags={setEquipmentTags}
              activeTagName={activeTagName}
              setActiveTagName={setActiveTagName}
            />
          )}
        </Viewport>
      </ReactPidLayout>
    </ReactPidWrapper>
  );
};
