import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Asset, CogniteClient } from '@cognite/sdk';
import { CogniteOrnate } from 'library/cognite-ornate';
import {
  Drawing,
  OrnateAnnotation,
  OrnateAnnotationInstance,
  ToolType,
  ShapeSettings as ShapeSettingsType,
} from 'library/types';
import WorkSpaceSidebar from 'components/WorkSpaceSidebar';
import WorkSpaceTools from 'components/WorkSpaceTools';
import ShapeSettings from 'components/ShapeSettings';
import { defaultShapeSettings } from 'components/ShapeSettings/constants';
import { Button, Icon, toast, ToastContainer } from '@cognite/cogs.js';
import WorkspaceService from 'services/workspace.service';
import { Workspace, WorkspaceDocument } from 'types';
import { WorkspaceDocsPanel } from 'components/WorkspaceDocsPanel';
import { useTranslation } from 'hooks/useTranslation';
import { RecentWorkspaces } from 'components/Workspace/WorkspacesList';
import ListToolSidebar from 'components/ListToolSidebar';
import WorkSpaceSearch from 'components/WorkspaceDocsPanel/WorkspaceSearch';
import { WorkspaceHeader } from 'components/Workspace/WorkspaceHeader';
import { toDisplayDate } from 'utils/date';
import {
  ListItem,
  ListToolStatus,
  LIST_TOOL_STATUSES,
} from 'components/ListToolSidebar/ListToolSidebar';
import {
  MoveTool,
  LineTool,
  RectTool,
  TextTool,
  DefaultTool,
  CircleTool,
  ListTool,
} from 'library/tools';

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
  const workspaceService = new WorkspaceService(client);
  const ornateViewer = useRef<CogniteOrnate>();
  const [activeTool, setActiveTool] = useState<ToolType>('default');
  const [shapeSettings, setShapeSettings] =
    useState<ShapeSettingsType>(defaultShapeSettings);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const { t } = useTranslation('WorkspaceHeader');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaceDocuments, setWorkspaceDocuments] = useState<
    WorkspaceDocument[]
  >([]);
  const [listItems, setListItems] = useState<ListItem[]>([]);

  const [workspaceDocumentAnnotations, setWorkSpaceDocumentAnnotations] =
    useState<Record<string, OrnateAnnotationInstance[]>>();

  useEffect(() => {
    if (ornateViewer.current) {
      return;
    }
    ornateViewer.current = new CogniteOrnate({
      container: '#container',
    });
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
          text: marker.metadata?.text || '',
          assetId:
            marker.metadata?.assetId ||
            marker.shape.attrs?.metadata?.resourceId,
          status: marker.metadata?.status as ListToolStatus,
        }));
        setListItems(nextListItems);
      };
      ornateViewer.current.tools = {
        move: new MoveTool(ornateViewer.current),
        line: new LineTool(ornateViewer.current),
        rect: new RectTool(ornateViewer.current),
        circle: new CircleTool(ornateViewer.current),
        text: new TextTool(ornateViewer.current),
        list: listTool,
        default: new DefaultTool(ornateViewer.current),
      };
      onToolChange('default');
      ornateViewer.current.currentTool = ornateViewer.current.tools.default;
    }
  };

  const onDelete = useCallback(
    (e: Event) => {
      const deletedNode = (e as CustomEvent).detail;
      if (deletedNode && deletedNode.getType() === 'Group') {
        const doc = ornateViewer.current?.documents.find(
          (d) => d.group.attrs.id === deletedNode.attrs.id
        );

        if (doc) {
          onDeleteDocument({
            documentId: doc?.metadata!.fileId,
            documentName: doc?.metadata!.fileName,
          });
        }
      }
    },
    [workspaceDocuments]
  );

  useEffect(() => {
    document.addEventListener('onDelete', onDelete);
    document.addEventListener('onAnnotationClick', onAnnotationClick as any);

    return () => {
      document.removeEventListener('onDelete', onDelete);
      document.removeEventListener(
        'onAnnotationClick',
        onAnnotationClick as any
      );
    };
  }, [workspaceDocuments]);

  const onAnnotationClick = async (event: CustomEvent) => {
    const data = event.detail as OrnateAnnotationInstance;
    if (data.annotation?.metadata?.type === 'file') {
      const { resourceId } = data.annotation.metadata;
      if (!resourceId) {
        return;
      }
      const file = await client.files.retrieve([{ id: Number(resourceId) }]);

      if (!file) {
        return;
      }

      const fileInfo = await loadFile(file[0].id.toString(), file[0].name);
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
    ornateViewer.current!.handleToolChange(tool);
    setActiveTool(tool);
    onShapeSettingsChange({ tool });
  };

  const onShapeSettingsChange = (nextSettings: Partial<ShapeSettingsType>) => {
    ornateViewer.current!.handleShapeSettingsChange(nextSettings);
    setShapeSettings({ ...shapeSettings, ...nextSettings });
  };
  const loadWorkspace = async (workspace: Workspace) => {
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
          const { fileId, fileName } = doc.metadata;

          const workspaceDoc = await loadFile(fileId, fileName, {
            initialPosition: { x: doc.x, y: doc.y },
            zoomAfterLoad: false,
          });

          documents.push({ documentId: fileId, documentName: fileName });

          const parsedDrawings: Drawing[] = doc.drawings.map((drawing) => {
            return {
              ...drawing,
              groupId: workspaceDoc.doc?.group.id(),
            };
          });
          ornateViewer.current!.addDrawings(...parsedDrawings);
        })
      );
      contents.markers.forEach((marker) => {
        (ornateViewer.current!.tools.list as ListTool).addMarker({
          ...marker,
          shape: ornateViewer.current!.stage.findOne(`#${marker.shapeId}`),
        });
      });
      setWorkspaceDocuments(documents);

      if (contents!.connectedLines) {
        contents!.connectedLines.forEach((connectedLine) => {
          const docStart = ornateViewer.current?.documents.find(
            (d) => d.metadata!.fileId === connectedLine.nodeA.groupId
          );
          const docEnd = ornateViewer.current?.documents.find(
            (d) => d.metadata!.fileId === connectedLine.nodeB.groupId
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
    fileId: string,
    fileName: string,
    options?: {
      initialPosition?: { x: number; y: number };
      zoomAfterLoad?: boolean;
      showLoader?: boolean;
    }
  ) => {
    const { initialPosition = { x: 0, y: 0 }, zoomAfterLoad = true } =
      options || {};
    const existingDoc = ornateViewer.current!.documents.find(
      (doc) => doc.metadata?.fileId === String(fileId)
    );
    if (existingDoc) {
      console.log('document already exists!');
      ornateViewer.current!.zoomToDocument(existingDoc);
      return {};
    }
    setShowLoader(true);
    const urls = await client.files.getDownloadUrls([{ id: +fileId }]);
    if (!urls[0]) {
      console.error('Failed to get URL');
      throw new Error('Failed to get URL');
    }

    const newDoc = await ornateViewer.current!.addPDFDocument(
      urls[0].downloadUrl,
      1,
      { fileId: String(fileId), fileName },
      { initialPosition, zoomAfterLoad, groupId: String(fileId) }
    );

    const idEvents = await client.events.list({
      filter: {
        type: 'cognite_annotation',
        metadata: {
          CDF_ANNOTATION_file_id: String(fileId),
        },
      },
    });

    const annotations = idEvents.items.map((event) => {
      const box = JSON.parse(event.metadata?.CDF_ANNOTATION_box || '') as {
        yMin: number;
        yMax: number;
        xMin: number;
        xMax: number;
      };
      const type = event.metadata?.CDF_ANNOTATION_resource_type || 'unknown';
      const newAnnotation: OrnateAnnotation = {
        id: `${fileId}_${event.metadata?.CDF_ANNOTATION_resource_id}`,
        type: 'pct',
        x: box.xMin,
        y: box.yMin,
        width: box.xMax - box.xMin,
        height: box.yMax - box.yMin,
        fill:
          type === 'asset'
            ? 'rgba(74, 103, 251, 0.25)'
            : 'rgba(255, 184, 0, 0.25)',
        stroke:
          type === 'asset'
            ? 'rgba(74, 103, 251, 0.8)'
            : 'rgba(255, 184, 0, 0.8)',
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
      [fileId]: instances,
    }));
    setWorkspaceDocuments(
      workspaceService.addDocument(workspaceDocuments, fileId, fileName)
    );

    setShowLoader(false);
    return {
      doc: newDoc,
      instances,
    };
  };

  const onExport = useCallback(() => {
    ornateViewer.current!.onExport(workspace?.name);
  }, [workspace?.name]);

  const onSave = () => {
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
    setIsSidebarOpen(!isSidebarOpen);
  }, [isSidebarOpen]);

  const updateWorkspaceTitle = useCallback(
    (newTitle: string) => {
      if (!workspace) {
        return;
      }
      setWorkspace({
        ...workspace,
        name: newTitle,
      });
    },
    [workspace]
  );

  const onDeleteDocument = useCallback(
    (workspaceDoc: WorkspaceDocument) => {
      const docToRemove = ornateViewer.current!.documents.find(
        (doc) => doc.metadata && doc.metadata.fileId === workspaceDoc.documentId
      );
      if (docToRemove) {
        ornateViewer.current!.removeDocument(docToRemove);
        setWorkspaceDocuments(
          workspaceService.removeDocument(
            workspaceDocuments,
            workspaceDoc.documentId
          )
        );
      }
    },
    [ornateViewer, workspaceDocuments]
  );

  const onAssetClick = useCallback(
    (fileId: string, asset: Asset) => {
      const instance = workspaceDocumentAnnotations?.[fileId].find(
        (x) => x.annotation.metadata?.resourceId === String(asset.id)
      );
      if (instance) {
        ornateViewer.current?.zoomTo(instance.instance);
      }
    },
    [workspaceDocumentAnnotations]
  );

  const createNewWorkspace = () => {
    const ws = workspaceService.create();
    setWorkspace(ws);
    setWorkspaceDocuments([]);
    setActiveTool('default');
    ornateViewer.current!.restart();
    loadTools();
  };

  const showWorkspaces = () => {
    setWorkspace(null);
    setWorkspaceDocuments([]);
    ornateViewer.current!.restart();
    loadTools();
  };

  const deleteWorkspace = async (workspace: Workspace) => {
    await workspaceService.deleteWorkspace(workspace);
    setWorkspace(null);
    setWorkspaceDocuments([]);
    ornateViewer.current!.restart();
    loadTools();
  };

  const onZoom = (scale: number) => {
    ornateViewer.current?.onZoom(scale, false);
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
        <>
          <WorkspaceDocsPanel
            workspace={workspace as Workspace}
            workspaceDocs={workspaceDocuments}
            onLoadFile={loadFile}
            onWorkspaceTitleUpdated={updateWorkspaceTitle}
            onDeleteDocument={onDeleteDocument}
            onAssetClick={onAssetClick}
          />
        </>
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
      <ShapeSettings
        shapeSettings={shapeSettings}
        isSidebarExpanded={isSidebarOpen}
        onSettingsChange={onShapeSettingsChange}
      />
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

      {shapeSettingsComponent}

      <Button
        icon="WorkSpace"
        iconPlacement="left"
        size="default"
        type="ghost"
        className="workspace-toggle-button"
        onClick={toggleWorkSpaceSidebar}
      >
        {t('my-workspace-title', 'My Workspace')}
      </Button>
      <WorkSpaceTools
        onToolChange={onToolChange}
        isDisabled={!workspaceDocuments.length}
        isSidebarExpanded={isSidebarOpen}
        activeTool={activeTool}
      />
      <div id="container" />

      <MainToolbar>
        <Button
          type="secondary"
          icon="WorkSpaceSave"
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
      <Loader className={showLoader ? 'visible' : ''}>
        <Icon type="Loading" className="loading-icon" size={40} />
      </Loader>
    </WorkspaceContainer>
  );
};

export default Ornate;
