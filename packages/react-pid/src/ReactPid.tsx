/* eslint-disable no-param-reassign */

import {
  CognitePid,
  DiagramConnection,
  DiagramEquipmentTagInstance,
  DiagramLineInstance,
  DiagramSymbol,
  DocumentMetadata,
  DocumentType,
  EventType,
  IsoDocumentMetadata,
  PidDocumentMetadata,
  PidDocumentWithDom,
  SaveSymbolData,
  ToolType,
  saveGraphAsJson,
  getFileNameWithoutExtension,
} from '@cognite/pid-tools';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader } from '@cognite/cogs.js';

import SvgContainer, { CONTAINER_ID } from './components/viewport/SvgContainer';
import { ReactPidWrapper, ReactPidLayout, LoaderOverlay } from './elements';
import { SidePanel } from './components';
import useSymbolState from './components/side-panel/useSymbolState';
import { Toolbar } from './components/toolbar/Toolbar';
import { enableExitWarning, disableExitWarning } from './utils/exitWarning';
import { Viewport } from './components/viewport/Viewport';

export const ReactPid: React.FC = () => {
  const [hasDocumentLoaded, setHasDocumentLoaded] = useState(false);
  const pidViewer = useRef<CognitePid>();

  const getPidDocument = (): PidDocumentWithDom | undefined => {
    return pidViewer.current?.pidDocument;
  };

  const [activeTool, setActiveTool] = useState<ToolType>('selectDocumentType');
  const [fileUrl, setFileUrl] = useState<string>('');
  const [documentMetadata, setDocumentMetadata] = useState<DocumentMetadata>({
    type: DocumentType.unknown,
    name: 'Unknown',
    unit: 'Unknown',
  });
  const { symbols, setSymbols, symbolInstances, setSymbolInstances } =
    useSymbolState(pidViewer.current, documentMetadata.type, hasDocumentLoaded);
  const [lines, setLines] = useState<DiagramLineInstance[]>([]);
  const [connections, setConnections] = useState<DiagramConnection[]>([]);
  const [equipmentTags, setEquipmentTags] = useState<
    DiagramEquipmentTagInstance[]
  >([]);
  const [symbolSelection, setSymbolSelection] = useState<string[]>([]);
  const [hideSelection, setHideSelection] = useState<boolean>(false);
  const [lineNumbers, setLineNumbers] = useState<string[]>([]);
  const [activeLineNumber, setActiveLineNumber] = useState<string | null>(null);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [uploadSvgInput, setUploadSvgInput] = useState<HTMLInputElement | null>(
    null
  );
  const svgInputRef = useCallback((node: HTMLInputElement | null) => {
    setUploadSvgInput(node);
  }, []);

  const [uploadJsonInput, setUploadJsonInput] =
    useState<HTMLInputElement | null>(null);
  const jsonInputRef = useCallback((node: HTMLInputElement | null) => {
    setUploadJsonInput(node);
  }, []);
  const onUploadJsonClick = () => {
    if (uploadJsonInput) {
      uploadJsonInput.click();
    }
  };

  useEffect(() => {
    if (pidViewer.current) return;

    initPid(
      new CognitePid({
        container: `#${CONTAINER_ID}`,
      })
    );
  }, []);

  const initPid = (instance: CognitePid) => {
    pidViewer.current = instance;
    instance.addEventListener(EventType.LOAD, () => setHasDocumentLoaded(true));
  };

  useEffect(() => {
    if (pidViewer.current) {
      pidViewer.current.onChangeActiveTool(setActiveTool);
    }
  }, [setActiveTool]);

  useEffect(() => {
    if (pidViewer.current) {
      pidViewer.current.onChangeSymbolSelection(setSymbolSelection);
    }
  }, [setSymbolSelection]);

  useEffect(() => {
    if (pidViewer.current) {
      pidViewer.current.onChangeHideSelection(setHideSelection);
    }
  }, [setHideSelection]);

  useEffect(() => {
    if (pidViewer.current) {
      pidViewer.current.onChangeSymbols(setSymbols);
    }
  }, [setSymbols]);

  useEffect(() => {
    if (pidViewer.current) {
      pidViewer.current.onChangeSymbolInstances(setSymbolInstances);
    }
  }, [setSymbolInstances]);

  useEffect(() => {
    if (pidViewer.current) {
      pidViewer.current.onChangeLines(setLines);
    }
  }, [setLines]);

  useEffect(() => {
    if (pidViewer.current) {
      pidViewer.current.onChangeConnections(setConnections);
    }
  }, [setConnections]);

  useEffect(() => {
    if (pidViewer.current) {
      pidViewer.current.onChangeActiveLineNumber(setActiveLineNumber);
    }
  }, [setActiveLineNumber]);

  useEffect(() => {
    if (pidViewer.current) {
      pidViewer.current.onChangeActiveTagId(setActiveTagId);
    }
  }, [setActiveTagId]);

  useEffect(() => {
    if (pidViewer.current) {
      pidViewer.current.onChangeEquipmentTags(setEquipmentTags);
    }
  }, [setEquipmentTags]);

  useEffect(() => {
    if (pidViewer.current) {
      pidViewer.current.onChangeLineNumbers(setLineNumbers);
    }
  }, [lineNumbers]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.metaKey) {
        switch (e.code) {
          case 'KeyA': {
            autoAnalysis();
            return;
          }
          case 'KeyF': {
            onUploadJsonClick();
            return;
          }
          case 'KeyS': {
            toggleHideSelection();
            return;
          }
        }
      }

      switch (e.code) {
        case 'Space': {
          if (uploadSvgInput) {
            uploadSvgInput.click();
          }
        }
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
    };
  });

  useEffect(() => {
    if (
      documentMetadata.type !== DocumentType.unknown &&
      activeTool === 'selectDocumentType'
    ) {
      setActiveToolWrapper('addSymbol');
    }
  }, [documentMetadata]);

  useEffect(() => {
    if (activeTool !== 'addEquipmentTag' && activeTagId !== null) {
      pidViewer.current?.setActiveTagId(null);
    }
  }, [activeTool]);

  const setActiveToolWrapper = (tool: ToolType) => {
    if (!pidViewer.current) return;
    pidViewer.current.setActiveTool(tool);
  };

  const clearSymbolSelection = () => {
    if (!pidViewer.current) return;
    pidViewer.current.clearSymbolSelection();
  };

  const toggleHideSelection = () => {
    if (!pidViewer.current) return;
    pidViewer.current.setHideSelection(!hideSelection);
  };

  const setActiveLineNumberWrapper = (lineNumber: string | null) => {
    if (!pidViewer.current) return;
    pidViewer.current.setActiveLineNumber(lineNumber);
  };

  const setActiveTagIdWrapper = (activeTagId: string | null) => {
    if (!pidViewer.current) return;
    pidViewer.current.setActiveTagId(activeTagId);
  };

  const setLineNumbersWrapper = (lineNumbers: string[]) => {
    if (!pidViewer.current) return;
    pidViewer.current.setLineNumbers(lineNumbers);
  };

  const loadJson = (json: Record<string, unknown>) => {
    if (!pidViewer.current) return;
    pidViewer.current.loadJson(json);
  };

  const saveGraphAsJsonWrapper = () => {
    if (!pidViewer.current) return;

    const pidDocument = getPidDocument();
    if (pidDocument === undefined) return;

    saveGraphAsJson(
      pidDocument,
      symbols,
      lines,
      symbolInstances,
      connections,
      pidViewer.current.pathReplacements,
      documentMetadata,
      lineNumbers,
      equipmentTags,
      documentMetadata.name
        ? `${getFileNameWithoutExtension(documentMetadata.name)}.json`
        : 'graph.json'
    );

    disableExitWarning();
  };

  useEffect(() => {
    // any changes in save graph dependencies should trigger warning, but assume we can skip warning if there are no symbol instances
    if (symbolInstances.length) {
      enableExitWarning();
    }
  }, [
    symbols,
    lines,
    symbolInstances,
    connections,
    pidViewer,
    documentMetadata,
    lineNumbers,
    equipmentTags,
  ]);

  const autoAnalysis = () => {
    if (!pidViewer.current) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      pidViewer.current!.autoAnalysis(documentMetadata);
      setIsAnalyzing(false);
    }, 0);
  };

  const deleteSymbol = (diagramSymbol: DiagramSymbol) => {
    if (!pidViewer.current) return;
    pidViewer.current.deleteSymbol(diagramSymbol);
  };

  const deleteConnection = (connection: DiagramConnection) => {
    if (!pidViewer.current) return;
    pidViewer.current.deleteConnection(connection);
  };

  const saveSymbol = (symbolData: SaveSymbolData) => {
    if (!pidViewer.current) return;
    pidViewer.current.saveSymbol(symbolData);
  };

  const evalFileName = (file: File) => {
    const looksLikeIso = file.name.match(/L[0-9]{1,}-[0-9]{1,}/);
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
      const lineParts = looksLikeIso[0].split('-');
      const lineNumber = lineParts[0] || 'Unknown';
      const pageNumber = parseInt(lineParts[1], 10);
      setLineNumbers([lineNumber]);
      setDocumentMetadata({
        type: DocumentType.isometric,
        name,
        unit: unit ? unit[0] : 'Unknown',
        lineNumber,
        pageNumber,
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
      if (pidViewer.current && pidViewer.current.document === undefined) {
        pidViewer.current.addSvgDocument(file);
      } else {
        throw new Error('Failed to add SVG document to pidViewer');
      }
      return;
    }
    setFileUrl('');
  };

  const setDocumentType = (documentType: DocumentType) => {
    if (documentType === DocumentType.pid) {
      setDocumentMetadata({
        type: DocumentType.pid,
        documentNumber: -1,
        unit: 'Unknown',
      } as PidDocumentMetadata);
    } else if (documentType === DocumentType.isometric) {
      setDocumentMetadata({
        name: 'Unknown',
        type: DocumentType.isometric,
        unit: 'Unknown',
        lineNumber: 'Unknown',
        pageNumber: -1,
      } as IsoDocumentMetadata);
    }
  };

  return (
    <ReactPidWrapper>
      <ReactPidLayout>
        <SidePanel
          activeTool={activeTool}
          setActiveTool={setActiveToolWrapper}
          symbols={symbols}
          lines={lines}
          symbolInstances={symbolInstances}
          symbolSelection={symbolSelection}
          loadJson={loadJson}
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
          setLineNumbers={setLineNumbersWrapper}
          activeLineNumber={activeLineNumber}
          setActiveLineNumber={setActiveLineNumberWrapper}
          equipmentTags={equipmentTags}
          setEquipmentTags={setEquipmentTags}
          activeTagId={activeTagId}
          setActiveTagId={setActiveTagIdWrapper}
          hideSelection={hideSelection}
          toggleHideSelection={toggleHideSelection}
          clearSymbolSelection={clearSymbolSelection}
          jsonInputRef={jsonInputRef}
          onUploadJsonClick={onUploadJsonClick}
        />
        <Viewport>
          <SvgContainer
            hasDocumentLoaded={hasDocumentLoaded}
            documentWidth={pidViewer.current?.getDocumentWidth() ?? 0}
            documentHeight={pidViewer.current?.getDocumentHeight() ?? 0}
          />
          {fileUrl === '' && (
            <input
              ref={svgInputRef}
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
          )}
          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveToolWrapper}
            documentType={documentMetadata.type}
          />
        </Viewport>
      </ReactPidLayout>
      {isAnalyzing && (
        <LoaderOverlay>
          <Loader infoTitle="Analyzing" />
        </LoaderOverlay>
      )}
    </ReactPidWrapper>
  );
};
