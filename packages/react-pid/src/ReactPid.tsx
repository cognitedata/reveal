/* eslint-disable no-param-reassign */

import {
  CognitePid,
  DiagramConnection,
  DiagramLineInstance,
  DiagramSymbol,
  DiagramType,
  EventType,
  AddSymbolData,
  ToolType,
  saveGraphAsJson,
  PathReplacementGroup,
  DiagramTag,
} from '@cognite/pid-tools';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Loader } from '@cognite/cogs.js';

import { SaveState } from './utils/useCdfDiagrams';
import useDiagramFile from './utils/useDiagramFile';
import SvgContainer, { CONTAINER_ID } from './components/viewport/SvgContainer';
import { ReactPidWrapper, ReactPidLayout, LoaderOverlay } from './elements';
import { SidePanel } from './components';
import useSymbolState from './components/side-panel/useSymbolState';
import { Toolbar } from './components/toolbar/Toolbar';
import { enableExitWarning, disableExitWarning } from './utils/exitWarning';
import { Viewport } from './components/viewport/Viewport';

interface ReactPidProps {
  pidViewer?: React.MutableRefObject<CognitePid | undefined>;
  saveState?: SaveState;
  diagramExternalId?: string;
  isAutoMode?: boolean;
  onAutoAnalysisCompleted?: () => void;
}

export const ReactPid = ({
  pidViewer = useRef<CognitePid>(),
  saveState = SaveState.Ready,
  isAutoMode = false,
  diagramExternalId,
  onAutoAnalysisCompleted,
}: ReactPidProps) => {
  const [hasDocumentLoaded, setHasDocumentLoaded] = useState(false);

  const [activeTool, setActiveTool] = useState<ToolType>('selectDiagramType');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showLoader, setShowLoader] = useState(false);

  const [pathReplacementGroups, setPathReplacements] = useState<
    PathReplacementGroup[]
  >([]);

  const {
    file,
    handleFileUpload,
    loadFileIfProvided,
    isLoading,
    documentMetadata,
    setDiagramType,
  } = useDiagramFile(pidViewer, hasDocumentLoaded, diagramExternalId);

  const { symbols, setSymbols, symbolInstances, setSymbolInstances } =
    useSymbolState(pidViewer.current, documentMetadata.type, hasDocumentLoaded);
  const [lines, setLines] = useState<DiagramLineInstance[]>([]);
  const [connections, setConnections] = useState<DiagramConnection[]>([]);
  const [tags, setTags] = useState<DiagramTag[]>([]);
  const [symbolSelection, setSymbolSelection] = useState<string[]>([]);
  const [hideSelection, setHideSelection] = useState<boolean>(false);
  const [lineNumbers, setLineNumbers] = useState<string[]>([]);
  const [activeLineNumber, setActiveLineNumber] = useState<string | null>(null);
  const [activeTagId, setActiveTagId] = useState<string | null>(null);

  useEffect(() => {
    setShowLoader(isAnalyzing || isLoading);
  }, [isAnalyzing, isLoading]);

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
    initPid(
      new CognitePid({
        container: `#${CONTAINER_ID}`,
      })
    );
    loadFileIfProvided();
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
      pidViewer.current.onChangeTags(setTags);
    }
  }, [setTags]);

  useEffect(() => {
    if (pidViewer.current) {
      pidViewer.current.onChangeLineNumbers(setLineNumbers);
    }
  }, [lineNumbers]);

  useEffect(() => {
    if (pidViewer.current) {
      pidViewer.current.onChangePathReplacements(setPathReplacements);
    }
  }, [setPathReplacements]);

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
      documentMetadata.type !== DiagramType.UNKNOWN &&
      activeTool === 'selectDiagramType'
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

    const graph = pidViewer.current.getGraphDocument();

    if (graph === null) {
      throw Error('Error saving as graph');
    }
    saveGraphAsJson(graph);
    disableExitWarning();
  };

  useEffect(() => {
    // any changes in save graph dependencies should trigger warning, but assume we can skip warning if there are no symbol instances
    if (symbolInstances.length && saveState !== SaveState.Saved) {
      enableExitWarning();
    } else {
      disableExitWarning();
    }
  }, [
    symbols,
    lines,
    symbolInstances,
    connections,
    pidViewer,
    documentMetadata,
    lineNumbers,
    tags,
    saveState,
  ]);

  const autoAnalysis = () => {
    if (!pidViewer.current) return;
    setIsAnalyzing(true);
    setTimeout(() => {
      pidViewer.current!.autoAnalysis(documentMetadata);
      setIsAnalyzing(false);
      if (isAutoMode && onAutoAnalysisCompleted) {
        onAutoAnalysisCompleted();
      }
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

  const addSymbolFromSymbolSelection = (symbolData: AddSymbolData) => {
    if (!pidViewer.current) return;
    pidViewer.current.addSymbolFromSymbolSelection(symbolData);
  };

  const deletePathReplacementGroups = (
    pathReplacementGroupIds: string[] | string
  ) => {
    if (!pidViewer.current) return;
    pidViewer.current.deletePathReplacementGroups(pathReplacementGroupIds);
  };

  useEffect(() => {
    if (file) {
      if (pidViewer.current && pidViewer.current.document === undefined) {
        pidViewer.current.addSvgDocument(file);
      } else {
        throw new Error('Failed to add SVG document to pidViewer');
      }
    }
  }, [file]);

  useEffect(() => {
    if (isAutoMode) {
      autoAnalysis();
    }
  }, [isAutoMode, hasDocumentLoaded]);

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
          addSymbolFromSymbolSelection={addSymbolFromSymbolSelection}
          connections={connections}
          deleteSymbol={deleteSymbol}
          deleteConnection={deleteConnection}
          file={file}
          autoAnalysis={autoAnalysis}
          saveGraphAsJson={saveGraphAsJsonWrapper}
          documentMetadata={documentMetadata}
          setDiagramType={setDiagramType}
          lineNumbers={lineNumbers}
          setLineNumbers={setLineNumbersWrapper}
          activeLineNumber={activeLineNumber}
          setActiveLineNumber={setActiveLineNumberWrapper}
          tags={tags}
          setTags={setTags}
          activeTagId={activeTagId}
          setActiveTagId={setActiveTagIdWrapper}
          hideSelection={hideSelection}
          toggleHideSelection={toggleHideSelection}
          clearSymbolSelection={clearSymbolSelection}
          jsonInputRef={jsonInputRef}
          onUploadJsonClick={onUploadJsonClick}
          pathReplacementGroups={pathReplacementGroups}
          deletePathReplacementGroups={deletePathReplacementGroups}
        />
        <Viewport>
          <SvgContainer
            hasDocumentLoaded={hasDocumentLoaded}
            documentWidth={pidViewer.current?.getDocumentWidth() ?? 0}
            documentHeight={pidViewer.current?.getDocumentHeight() ?? 0}
          />
          {file === null && (
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
              onChange={handleFileUpload}
            />
          )}
          <Toolbar
            activeTool={activeTool}
            setActiveTool={setActiveToolWrapper}
            diagramType={documentMetadata.type}
          />
        </Viewport>
      </ReactPidLayout>
      {showLoader && (
        <LoaderOverlay>
          <Loader infoTitle={isLoading ? 'Loading' : 'Analyzing'} />
        </LoaderOverlay>
      )}
    </ReactPidWrapper>
  );
};
