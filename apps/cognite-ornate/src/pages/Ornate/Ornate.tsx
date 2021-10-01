import React, { useCallback, useEffect, useRef, useState } from 'react';
import { CogniteClient } from '@cognite/sdk';
import { CogniteOrnate } from 'library/cognite-ornate';
import {
  Drawing,
  OrnateAnnotation,
  OrnateAnnotationInstance,
  ToolType,
} from 'library/types';
import WorkSpaceSidebar from 'components/WorkSpaceSidebar';
import WorkSpaceTools from 'components/WorkSpaceTools';
import { Button, Icon, toast, ToastContainer } from '@cognite/cogs.js';
import { workspaceService } from 'services';
import { Workspace, WorkspaceDocument } from 'types';
import { WorkspaceDocsPanel } from 'components/WorkspaceDocsPanel';
import { useTranslation } from 'hooks/useTranslation';
import { RecentWorkspaces } from 'components/Workspace/WorkspacesList';
import WorkSpaceSearch from 'components/WorkspaceDocsPanel/WorkspaceSearch';
import { WorkspaceHeader } from 'components/Workspace/WorkspaceHeader';
import { toDisplayDate } from 'utils/date';

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
  const ornateViewer = useRef<CogniteOrnate>();
  const [activeTool, setActiveTool] = useState<ToolType>('default');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showLoader, setShowLoader] = useState(false);
  const { t } = useTranslation('WorkspaceHeader');
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [workspaceDocuments, setWorkspaceDocuments] = useState<
    WorkspaceDocument[]
  >([]);

  useEffect(() => {
    ornateViewer.current = new CogniteOrnate({
      container: '#container',
    });
  }, []);

  const onAnnotationClick = async (data: OrnateAnnotationInstance) => {
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
      const endPointAnnotation = instances.find(
        (x) =>
          x.annotation.metadata?.resourceId === data.document?.metadata?.fileId
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

    if (data.annotation?.metadata?.type === 'asset') {
      console.log('asset');
    }
  };

  const onToolChange = (tool: ToolType) => {
    ornateViewer.current!.handleToolChange(tool);
    setActiveTool(tool);
  };

  const loadWorkspace = async (workspace: Workspace) => {
    try {
      setShowLoader(true);
      setWorkspace(workspace);
      setWorkspaceDocuments([]);
      onToolChange('default');
      const contents = await workspaceService.loadWorkspaceContents(workspace);

      ornateViewer.current!.restart();

      const documents = [] as WorkspaceDocument[];
      await Promise.all(
        contents!.documents.map(async (doc) => {
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
      setWorkspaceDocuments(documents);
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
        onClick: onAnnotationClick,
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

    setWorkspaceDocuments(
      workspaceService.addDocument(workspaceDocuments, fileId, fileName)
    );

    return {
      doc: newDoc,
      instances,
    };
  };

  const onExport = () => {
    ornateViewer.current!.onExport();
  };

  const onSave = () => {
    if (!workspace) {
      return;
    }
    const json = ornateViewer.current!.exportToJSON();
    workspaceService.saveWorkspaceContents(workspace.id, json);
    workspaceService.saveWorkspace(workspace);
    toast.success(t('save_success', 'Workspace was saved'), {
      position: 'top-right',
      autoClose: 3000,
    });
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
      // ornateViewer.current!
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

  const createNewWorkspace = () => {
    const ws = workspaceService.create();
    setWorkspace(ws);
    setWorkspaceDocuments([]);
    setActiveTool('default');
    ornateViewer.current!.restart();
  };

  const showWorkspaces = () => {
    setWorkspace(null);
    setWorkspaceDocuments([]);
    ornateViewer.current!.restart();
  };

  const deleteWorkspace = async (workspace: Workspace) => {
    await workspaceService.deleteWorkspace(workspace);
    setWorkspace(null);
    setWorkspaceDocuments([]);
    ornateViewer.current!.restart();
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

  return (
    <WorkspaceContainer>
      <ToastContainer />
      <WorkSpaceSidebar
        isOpen={isSidebarOpen}
        header={sidebarHeader}
        content={sidebarContent}
        footer={sidebarFooter}
      />

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
