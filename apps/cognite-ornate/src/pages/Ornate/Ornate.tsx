import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Asset, CogniteClient, FileInfo } from '@cognite/sdk';
import {
  CogniteOrnate,
  // Types
  Drawing,
  OrnateAnnotation,
  OrnateAnnotationInstance,
  ToolType,
  // Tools
  MoveTool,
  LineTool,
  RectTool,
  TextTool,
  DefaultTool,
  CircleTool,
  ListTool,
  CommentTool,
  StampTool,
  OrnateTransformer,
  UpdateKeyType,
  SquiggleTool,
} from '@cognite/ornate';
import debounce from 'lodash/debounce';
import WorkSpaceSidebar from 'components/WorkSpaceSidebar';
import WorkSpaceTools from 'components/WorkSpaceTools';
import ShapeSettings from 'components/ShapeSettings';
import { Button, Icon, toast, ToastContainer } from '@cognite/cogs.js';
import WorkspaceService from 'services/workspace.service';
import { Workspace, WorkspaceDocument } from 'types';
import { WorkspaceDocsPanel } from 'components/WorkspaceDocsPanel';
import { useTranslation } from 'hooks/useTranslation';
import { RecentWorkspaces } from 'components/Workspace/WorkspacesList';
import ListToolSidebar from 'components/ListToolSidebar';
import StampToolSidebar from 'components/StampToolSidebar';
import WorkSpaceSearch from 'components/WorkspaceDocsPanel/WorkspaceSearch';
import { WorkspaceHeader } from 'components/Workspace/WorkspaceHeader';
import { LIST_TOOL_STATUSES } from 'components/ListToolSidebar/Task';
import { toDisplayDate } from 'utils/date';
import { CommentTarget } from '@cognite/comment-service-types';
import {
  ListItem,
  ListToolStatus,
} from 'components/ListToolSidebar/ListToolSidebar';
import Konva from 'konva';
import { Theme } from 'utils/theme';
import { Comments } from 'components/Comments/Comments';
import { useMetrics } from '@cognite/metrics';
import ContextMenu from 'components/ContextMenu';
import { defaultShapeSettings, OrnateContext } from 'context';
import { Node, NodeConfig } from 'konva/lib/Node';
import isNumber from 'lodash/isNumber';

import {
  Loader,
  MainToolbar,
  WorkspaceContainer,
  ZoomButtonsToolbar,
} from './elements';

interface OrnateProps {
  client: CogniteClient;
}

const Ornate: React.FC<OrnateProps> = ({ client }: OrnateProps) => {
  const { ornateViewer, initOrnate, activeTool, setActiveTool } =
    useContext(OrnateContext);
  const workspaceService = new WorkspaceService(client);
  const metrics = useMetrics('Ornate');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const [selectedNode, setSelectedNode] = useState<Konva.Node | null>(null);
  const { t } = useTranslation('WorkspaceHeader');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaceDocuments, setWorkspaceDocuments] = useState<
    WorkspaceDocument[]
  >([]);
  const [target, setTarget] = React.useState<CommentTarget | undefined>();
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const stampTool = useRef<StampTool>();
  const [workspaceDocumentAnnotations, setWorkSpaceDocumentAnnotations] =
    useState<Record<string, OrnateAnnotationInstance[]>>();
  const [activeStamp, setActiveStamp] = useState<string>('');

  useEffect(() => {
    if (ornateViewer.current) {
      return;
    }

    initOrnate(
      new CogniteOrnate({
        container: '#container',
      })
    );

    ornateViewer.current!.shapeSettings = defaultShapeSettings;

    document.addEventListener('ornate_toolChange', ((
      e: CustomEvent<ToolType>
    ) => {
      setActiveTool(e.detail);
    }) as EventListener);
    loadTools();
  }, []);

  const loadTools = () => {
    if (ornateViewer.current) {
      // Reset the list tool
      setListItems([]);
      const listTool = new ListTool(ornateViewer.current);
      listTool.onMarkersChange = (markers) => {
        // Transform markers into list items
        const nextListItems: ListItem[] = markers.map((marker) => ({
          marker,
          order: marker.order,
          text: marker.metadata?.text || marker.shape.attrs?.text || '',
          assetId:
            marker.metadata?.assetId ||
            marker.shape.attrs?.metadata?.resourceId,
          status: marker.metadata?.status as ListToolStatus,
        }));
        setListItems(nextListItems);
      };

      stampTool.current = new StampTool(ornateViewer.current);

      const ornateTransformer = new OrnateTransformer(ornateViewer.current);
      ornateTransformer.onSelectNodes = (nodes) => {
        setSelectedNode(nodes[0]);
      };
      ornateViewer.current.transformer = ornateTransformer;
      ornateViewer.current.drawingLayer.add(ornateViewer.current.transformer);

      ornateViewer.current.tools = {
        move: new MoveTool(ornateViewer.current),
        line: new LineTool(ornateViewer.current),
        rect: new RectTool(ornateViewer.current),
        circle: new CircleTool(ornateViewer.current),
        text: new TextTool(ornateViewer.current),
        comment: new CommentTool(ornateViewer.current),
        list: listTool,
        stamp: stampTool.current,
        squiggle: new SquiggleTool(ornateViewer.current),
        default: new DefaultTool(ornateViewer.current),
      };
      onToolChange('default');
      ornateViewer.current.currentTool = ornateViewer.current.tools.default;
    }
  };

  const onDelete = useCallback(
    (e: Event) => {
      metrics.track('onDeleteDocument');
      const deletedNode = (e as CustomEvent).detail;
      if (deletedNode && deletedNode.getType() === 'Group') {
        const doc = ornateViewer.current?.documents.find(
          (d) => d.group.attrs.id === deletedNode.attrs.id
        );

        if (doc) {
          onDeleteDocument(doc?.metadata!.fileId);
        }
      }
    },
    [workspaceDocuments]
  );

  const updateShape = debounce(
    (
      shape: Node<NodeConfig>,
      updateKey: UpdateKeyType,
      updateValue: string | number
    ) => {
      ornateViewer.current?.updateShape(shape, updateKey, updateValue);
    },
    1000
  );

  useEffect(() => {
    document.addEventListener('onDelete', onDelete);
    document.addEventListener('onAnnotationClick', onAnnotationClick as any);
    document.addEventListener('onCommentClick', onCommentClick as any);

    const onKeyDown = (e: KeyboardEvent) => {
      if (!workspaceDocuments.length) {
        return;
      }

      if (e.metaKey) {
        if (e.key === 'c') {
          ornateViewer.current!.transformer!.copySelectedNodes();
        }
        if (e.key === 'v') {
          ornateViewer.current!.transformer!.pasteSelectedNodes();
        }
      }

      if (e.ctrlKey) {
        if (e.key === 'c') {
          ornateViewer.current!.transformer!.copySelectedNodes();
        }
        if (e.key === 'v') {
          ornateViewer.current!.transformer!.pasteSelectedNodes();
        }
      }

      // Prevent ctrl and cmd key combination
      if (e.key !== 'Control' && !e.metaKey) {
        metrics.track('onHotkey', { key: e.key });
        if (e.key === 'm') {
          onToolChange('move');
        }
        if (e.key === 'r') {
          onToolChange('rect');
        }
        if (e.key === 'l') {
          onToolChange('line');
        }
        if (e.key === 't') {
          onToolChange('text');
        }
        if (e.key === 'c') {
          onToolChange('circle');
        }
        if (e.key === 'i') {
          onToolChange('list');
        }
        if (e.key === 's' || e.key === 'Escape') {
          onToolChange('default');
        }
      }
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault(); // needed so the undo does not trigger the Chrome undo shortcut
        ornateViewer.current?.history.undoChanges(ornateViewer.current);
      }
      if (
        (e.ctrlKey || e.metaKey) &&
        e.shiftKey &&
        (e.key || '').toLowerCase() === 'z'
      ) {
        e.preventDefault(); // needed so the redo does not trigger the Chrome redo shortcut
        ornateViewer.current?.history.redoChanges(ornateViewer.current);
      }
    };

    const stageContainer = ornateViewer.current
      ? ornateViewer.current.stage.container()
      : null;
    if (stageContainer) {
      stageContainer.addEventListener('keydown', onKeyDown);
    }

    return () => {
      document.removeEventListener('onDelete', onDelete);
      document.removeEventListener(
        'onAnnotationClick',
        onAnnotationClick as any
      );
      document.removeEventListener('onCommentClick', onCommentClick as any);

      if (stageContainer) {
        stageContainer.removeEventListener('keydown', onKeyDown);
      }
    };
  }, [workspaceDocuments]);

  const onCommentClick = (event: CustomEvent) => {
    metrics.track('onCommentClick');
    const commentNode = event.detail;
    const id = commentNode.attrs.id.toString();
    onToolChange('default');
    ornateViewer.current!.currentTool = ornateViewer.current!.tools.default;
    setTimeout(() => {
      setTarget({ id, targetType: 'comments' });
    });
  };

  const onAnnotationClick = async (event: CustomEvent) => {
    const data = event.detail as OrnateAnnotationInstance;
    metrics.track('onAnnotationClick', {
      type: data.annotation?.metadata?.type,
    });
    if (data.annotation?.metadata?.type === 'file') {
      const { resourceId } = data.annotation.metadata;
      if (!resourceId) {
        return;
      }
      const file = await client.files.retrieve([{ id: Number(resourceId) }]);

      if (!file) {
        return;
      }

      const fileInfo = await loadFile(
        { id: file[0].id, externalId: file[0].externalId },
        file[0].name
      );
      if (!fileInfo) {
        return;
      }
      const { doc, instances = [] } = fileInfo;
      const docFileId = data.document?.metadata?.fileId;
      const endPointAnnotation = instances.find(
        (x) => x.annotation.metadata?.resourceId === docFileId
      );
      if (!doc) {
        return;
      }
      ornateViewer.current!.connectDocuments(
        data.document,
        doc,
        { x: data.instance.x(), y: data.instance.y() },
        data.instance,
        endPointAnnotation?.instance
      );
    }
  };

  const onToolChange = (tool: ToolType) => {
    metrics.track('toolChange', { tool });
    ornateViewer.current!.handleToolChange(tool);
    setActiveTool(tool);
  };

  const loadWorkspace = async (workspace: Workspace) => {
    metrics.track('loadWorkspace');
    try {
      setShowLoader(true);
      setWorkspace(workspace);
      setWorkspaceDocuments([]);
      onToolChange('default');
      const contents = await workspaceService
        .loadWorkspace(workspace.id)
        .then((space) => space.content);
      ornateViewer.current!.restart();
      loadTools();

      const documents = [] as WorkspaceDocument[];
      await Promise.all(
        contents.documents.map(async (doc) => {
          const { x, y } = doc;
          const { fileId, fileName, fileExternalId } = doc.metadata;
          const workspaceDoc = await loadFile(
            { id: +fileId, externalId: fileExternalId },
            fileName,
            {
              initialPosition: { x, y },
              zoomAfterLoad: false,
            }
          );

          documents.push({
            documentId: fileId,
            documentName: fileName,
            documentExId: fileExternalId,
            x,
            y,
          });

          const parsedDrawings: Drawing[] = doc.drawings.map((drawing) => {
            return {
              ...drawing,
              attrs: {
                ...drawing.attrs,
                inGroup: workspaceDoc.doc?.group.id(),
              },
              groupId: workspaceDoc.doc?.group.id(),
            };
          });
          ornateViewer.current!.addDrawings(...parsedDrawings);
        })
      );
      const stage = ornateViewer.current && ornateViewer.current.stage;
      if (ornateViewer.current && stage) {
        ornateViewer.current.zoomToGroup(ornateViewer.current.baseLayer, {
          relativeTo: stage as unknown as Konva.Container,
        });
      }
      contents.markers.forEach((marker) => {
        (ornateViewer.current!.tools.list as ListTool).addMarker({
          ...marker,
          shape: ornateViewer.current!.stage.findOne(`#${marker.shapeId}`),
        });
      });
      setWorkspaceDocuments(documents);
      if (contents.connectedLines) {
        contents!.connectedLines.forEach((connectedLine) => {
          const docStart = ornateViewer.current?.documents.find(
            (d) =>
              d.metadata!.fileId === connectedLine.nodeA.groupId ||
              d.metadata!.fileExternalId === connectedLine.nodeA.groupId
          );
          const docEnd = ornateViewer.current?.documents.find(
            (d) =>
              d.metadata!.fileId === connectedLine.nodeB.groupId ||
              d.metadata!.fileExternalId === connectedLine.nodeB.groupId
          );

          const annotationA = (docStart?.group.children || []).find(
            (a) =>
              a.attrs.x === connectedLine.nodeA.x &&
              a.attrs.y === connectedLine.nodeA.y &&
              a.attrs.metadata!.type === 'file' &&
              a.attrs.metadata!.resourceId ===
                connectedLine.nodeA.metadata!.resourceId
          );
          let annotationB = (docEnd?.group.children || []).find(
            (a) =>
              a.attrs.x === connectedLine.nodeB.x &&
              a.attrs.y === connectedLine.nodeB.y &&
              a.attrs.metadata!.type === 'file' &&
              a.attrs.metadata!.resourceId ===
                connectedLine.nodeB.metadata!.resourceId
          );

          // when the connection made to a group
          if (!connectedLine.nodeB.metadata) {
            annotationB = docEnd?.group;
          }

          if (annotationA && annotationB && docStart && docEnd) {
            ornateViewer.current?.connectDocuments(
              docStart,
              docEnd,
              { x: annotationA.x(), y: annotationA.y() },
              annotationA,
              annotationB,
              false,
              false
            );
          }
        });
      }
      setShowLoader(false);
    } catch (err) {
      console.error(err);
      toast.error(
        t(
          'error_load_workspace',
          'An error occured, the workspace could not be loaded!'
        )
      );
      setShowLoader(false);
    }
  };

  const loadFile = async (
    fileReference: { id: number; externalId?: string },
    fileName: string,
    options?: {
      initialPosition?: { x: number; y: number };
      zoomAfterLoad?: boolean;
      showLoader?: boolean;
    }
  ) => {
    metrics.track('loadFile');
    const { initialPosition = { x: 0, y: 0 }, zoomAfterLoad = true } =
      options || {};
    const existingDoc = ornateViewer.current!.documents.find(
      (doc) =>
        doc.metadata?.fileExternalId === String(fileReference.externalId) ||
        doc.metadata?.fileId === String(fileReference.id)
    );
    const rightX = isNumber(options?.initialPosition?.x)
      ? initialPosition.x
      : 50 + // add some space to the next document
        // get document highest x coordinate + document width
        workspaceDocuments.reduce<number>((maxX, workspaceDoc) => {
          if (workspaceDoc.x < maxX) {
            return maxX;
          }
          // find overlapped document in viewer
          const overlappedDocInViewer = ornateViewer.current!.documents.find(
            (viewerDoc) =>
              viewerDoc.metadata?.fileExternalId ===
                workspaceDoc.documentExId ||
              viewerDoc.metadata?.fileId === workspaceDoc.documentId
          );
          const docWidth = overlappedDocInViewer?.kImage.width() || 0;
          const docHeight = overlappedDocInViewer?.kImage.height() || 0;
          // Most PIDs has width 2500 and height 1760, so we calculate the position based on this size
          const newDocHeight = 1760;
          const newDocY = initialPosition.y;

          // check Y position
          if (
            workspaceDoc.y < newDocY &&
            workspaceDoc.y + docHeight <= newDocY
          ) {
            // new doc will not overlap the workspace doc. Keep rightX position
            return maxX;
          }
          if (
            workspaceDoc.y > newDocY &&
            newDocY + newDocHeight <= workspaceDoc.y
          ) {
            // new doc will not overlap the workspace doc. Keep rightX position
            return maxX;
          }
          // new doc will overlap the workspace doc. shifting rightX
          return Math.trunc(workspaceDoc.x + docWidth);
        }, 0);

    if (existingDoc) {
      ornateViewer.current!.zoomToDocument(existingDoc);
      return {};
    }
    setShowLoader(true);
    const file = await client.files.retrieve([{ id: +fileReference.id }]).then(
      (res) =>
        ({
          ...res[0],
          externalId: res[0].externalId || res[0].id,
        } as FileInfo)
    );
    const url = await client.files
      .getDownloadUrls([{ id: file.id }])
      .then((res) => res[0]?.downloadUrl);
    if (!url || !file) {
      console.error('Failed to get URL');
      throw new Error('Failed to get URL');
    }

    const newDoc = await ornateViewer.current!.addPDFDocument(
      url,
      1,
      {
        fileId: String(file.id),
        fileName,
        fileExternalId: file.externalId || '',
      },
      {
        initialPosition: { ...initialPosition, x: rightX },
        zoomAfterLoad,
        groupId: String(file.externalId),
      }
    );

    const idEvents = await client.events
      .list({
        filter: {
          type: 'cognite_annotation',
          metadata: {
            CDF_ANNOTATION_file_id: String(file.id),
          },
        },
      })
      .then((res) => res.items);

    const exIdEvents = await client.events
      .list({
        filter: {
          type: 'cognite_annotation',
          metadata: {
            CDF_ANNOTATION_file_external_id: String(file.externalId),
          },
        },
      })
      .then((res) => res.items);

    const annotations = [...idEvents, ...exIdEvents].map((event) => {
      const box = JSON.parse(event.metadata?.CDF_ANNOTATION_box || '') as {
        yMin: number;
        yMax: number;
        xMin: number;
        xMax: number;
      };
      const type = event.metadata?.CDF_ANNOTATION_resource_type || 'unknown';
      const newAnnotation: OrnateAnnotation = {
        id: `${file.id}_${event.metadata?.CDF_ANNOTATION_resource_id}`,
        type: 'pct',
        x: box.xMin,
        y: box.yMin,
        width: box.xMax - box.xMin,
        height: box.yMax - box.yMin,
        fill:
          type === 'asset'
            ? Theme.annotationAssetFill
            : Theme.annotationFileFill,
        strokeWidth: 2,
        onClick: (data) => {
          const evt = new CustomEvent('onAnnotationClick', { detail: data });

          document.dispatchEvent(evt);
        },
        metadata: {
          type,
          resourceId: event.metadata?.CDF_ANNOTATION_resource_id || '',
        },
      };
      return newAnnotation;
    });
    const instances = ornateViewer.current!.addAnnotationsToGroup(
      newDoc,
      annotations
    );
    setWorkSpaceDocumentAnnotations((prev) => ({
      ...prev,
      [file.id]: instances,
    }));
    setWorkspaceDocuments(
      workspaceService.addDocument(workspaceDocuments, {
        documentId: String(file.id),
        documentName: fileName,
        documentExId: file.externalId,
        x: rightX,
        y: initialPosition.y,
      })
    );

    setShowLoader(false);
    return {
      doc: newDoc,
      instances,
    };
  };

  const onExport = useCallback(() => {
    metrics.track('onExportWorkspace');
    ornateViewer.current!.onExport(workspace?.name);
  }, [workspace?.name]);

  const onSave = () => {
    metrics.track('onSave');
    try {
      if (!workspace) {
        return;
      }
      setShowLoader(true);
      const json = ornateViewer.current!.exportToJSON();
      workspaceService.saveWorkspace({
        ...workspace,
        content: {
          connectedLines: json.connectedLines,
          documents: json.documents.map((doc) => {
            return {
              ...doc,
              drawings: doc.drawings.filter(
                (drawing) => drawing.attrs.userGenerated
              ),
            };
          }),
          markers: (ornateViewer.current!.tools.list as ListTool).markers,
        },
      });
      toast.success(t('save_success', 'Workspace was saved'), {
        position: 'top-right',
        autoClose: 3000,
      });
      setShowLoader(false);
    } catch (err) {
      setShowLoader(false);
      console.error(err);
      toast.error(
        t('save_fail', 'An error occured, the workspace was not saved!'),
        {
          position: 'top-right',
          autoClose: 3000,
        }
      );
    }
  };

  const toggleWorkSpaceSidebar = useCallback(() => {
    metrics.track('toggleWorkSpaceSidebar');
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  const updateWorkspaceTitle = useCallback(
    (newTitle: string) => {
      if (!workspace) {
        return;
      }
      metrics.track('updateWorkspaceTitle', { newTitle });
      setWorkspace({
        ...workspace,
        name: newTitle,
      });
    },
    [workspace]
  );

  const onDeleteDocument = useCallback(
    (workspaceDocId: string) => {
      metrics.track('onDeleteDocument');
      const docToRemove = ornateViewer.current!.documents.find(
        (doc) => doc.metadata && doc.metadata.fileId === workspaceDocId
      );
      if (docToRemove) {
        ornateViewer.current!.removeDocument(docToRemove);
        setWorkspaceDocuments(
          workspaceService.removeDocument(workspaceDocuments, workspaceDocId)
        );
      }
    },
    [ornateViewer, workspaceDocuments]
  );

  const onAssetClick = useCallback(
    (fileId: string, asset: Asset) => {
      metrics.track('onAssetClick');
      const instance = workspaceDocumentAnnotations?.[fileId].find(
        (x) => x.annotation.metadata?.resourceId === String(asset.id)
      );
      if (instance) {
        ornateViewer.current?.zoomToNode(instance.instance);
      }
    },
    [workspaceDocumentAnnotations]
  );

  const createNewWorkspace = () => {
    const ws = workspaceService.create();
    metrics.track('createNewWorkspace');
    setWorkspace(ws);
    setWorkspaceDocuments([]);
    setActiveTool('default');
    ornateViewer.current!.restart();
    loadTools();
  };

  const showWorkspaces = () => {
    metrics.track('returnToWorkspaces');
    setWorkspace(null);
    setWorkspaceDocuments([]);
    ornateViewer.current!.restart();
    loadTools();
  };

  const deleteWorkspace = async (workspace: Workspace) => {
    metrics.track('deleteWorkspace');
    await workspaceService.deleteWorkspace(workspace);
    setWorkspace(null);
    setWorkspaceDocuments([]);
    ornateViewer.current!.restart();
    loadTools();
  };

  const onZoom = (scale: number) => {
    ornateViewer.current?.onZoom(scale, false);
  };

  const handleClose = () => {
    setTarget(undefined);
    onToolChange('default');
    ornateViewer.current!.currentTool = ornateViewer.current!.tools.default;
  };

  const sidebarHeader = (
    <WorkspaceHeader
      setIsOpen={setIsSidebarOpen}
      isBackVisible={workspace !== null}
      onBackClick={showWorkspaces}
    />
  );

  const sidebarContent =
    workspace !== null ? (
      <WorkSpaceSearch onLoadFile={loadFile}>
        <WorkspaceDocsPanel
          workspace={workspace as Workspace}
          workspaceDocs={workspaceDocuments}
          onLoadFile={loadFile}
          onWorkspaceTitleUpdated={updateWorkspaceTitle}
          onDeleteDocument={onDeleteDocument}
          onAssetClick={onAssetClick}
        />
      </WorkSpaceSearch>
    ) : (
      <RecentWorkspaces
        onLoadWorkspace={loadWorkspace}
        onDeleteWorkspace={deleteWorkspace}
      />
    );

  const sidebarFooter =
    workspace !== null ? (
      <div style={{ display: 'flex', color: '#595959', fontSize: '12px' }}>
        <span>
          {t('created', 'Created')}: {toDisplayDate(workspace.dateCreated)}
        </span>
        <span style={{ marginLeft: 'auto' }}>
          {t('last_updated', 'Last updated')}:{' '}
          {toDisplayDate(workspace.dateModified)}
        </span>
      </div>
    ) : (
      <Button type="secondary" onClick={createNewWorkspace}>
        {t('create_new', 'Create new')}
      </Button>
    );

  const shapeSettingsComponent =
    ornateViewer.current?.isCurrentToolUsingShapeSettings() && (
      <ShapeSettings isSidebarExpanded={isSidebarOpen} />
    );

  return (
    <WorkspaceContainer>
      <ToastContainer />
      <WorkSpaceSidebar
        isOpen={isSidebarOpen}
        header={sidebarHeader}
        content={sidebarContent}
        footer={sidebarFooter}
      />
      {activeTool === 'list' && (
        <ListToolSidebar
          listItems={listItems}
          onItemChange={(nextListItems) => {
            setListItems(nextListItems);
            (ornateViewer.current!.tools.list as ListTool).renderMarkers(
              nextListItems.map((x) => ({
                ...x.marker,
                order: x.order,
                metadata: {
                  status: x.status,
                  text: x.text,
                  assetId: x.assetId ? String(x.assetId) : undefined,
                },
                styleOverrides: x.status
                  ? LIST_TOOL_STATUSES[x.status].styleOverrides
                  : undefined,
              }))
            );
          }}
        />
      )}
      {activeTool === 'stamp' && (
        <StampToolSidebar
          activeStamp={activeStamp}
          onSelectStamp={(nextStampURL) => {
            setActiveStamp(nextStampURL);
            (ornateViewer.current?.tools.stamp as StampTool).setImageURL(
              nextStampURL
            );
          }}
        />
      )}

      {shapeSettingsComponent}

      {selectedNode && (
        <ContextMenu selectedNode={selectedNode} updateShape={updateShape} />
      )}

      <Button
        icon="FlowChart"
        iconPlacement="left"
        size="default"
        type="ghost"
        className="workspace-toggle-button"
        onClick={toggleWorkSpaceSidebar}
      >
        {t('my-workspace-title', 'My Workspace')}
      </Button>
      {ornateViewer.current && (
        <WorkSpaceTools
          onToolChange={onToolChange}
          onSetLayerVisibility={(layer, visible) => {
            const shapes: Konva.Node[] = [];
            if (layer === 'ANNOTATIONS') {
              // Get annotations. Then filter out the ones affected by the list tool
              shapes.push(
                ...(
                  ornateViewer.current?.stage.find('.annotation') || []
                ).filter((shape) => !shape.attrs.inList)
              );
            }
            if (layer === 'DRAWINGS') {
              shapes.push(
                ...(ornateViewer.current?.stage.find('.drawing') || []).filter(
                  (shape) => !shape.attrs.inList
                )
              );
            }
            if (layer === 'MARKERS') {
              shapes.push(
                ...(ornateViewer.current?.stage.find('.marker') || [])
              );
            }
            shapes.forEach((shape) => {
              if (visible) {
                shape.show();
              } else {
                shape.hide();
              }
            });
          }}
          isDisabled={!workspaceDocuments.length}
          isSidebarExpanded={isSidebarOpen}
          activeTool={activeTool}
        />
      )}

      <div id="container" />

      <MainToolbar>
        <Button
          type="secondary"
          icon="Save"
          onClick={onSave}
          disabled={!workspaceDocuments.length}
          style={{ marginRight: '10px' }}
        >
          {t('save', 'Save')}
        </Button>

        <Button
          icon="Download"
          type="primary"
          onClick={onExport}
          disabled={!workspaceDocuments.length}
        >
          {t('download', 'Download')}
        </Button>
      </MainToolbar>
      <ZoomButtonsToolbar>
        <Button type="ghost" onClick={() => onZoom(-1)}>
          <Icon type="ZoomIn" />
        </Button>

        <Button type="ghost" onClick={() => onZoom(1)}>
          <Icon type="ZoomOut" />
        </Button>
      </ZoomButtonsToolbar>

      {target && <Comments target={target} handleClose={handleClose} />}

      <Loader className={showLoader ? 'visible' : ''}>
        <Icon type="Loader" className="loading-icon" size={40} />
      </Loader>
    </WorkspaceContainer>
  );
};

export default Ornate;
