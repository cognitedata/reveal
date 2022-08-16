import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FileInfo, Timeseries } from '@cognite/sdk';
import { Button, Dropdown, Menu } from '@cognite/cogs.js';
import Blueprint from 'components/Blueprint';
import FileSidebar from 'components/FileSidebar';
import TimeSeriesSidebar from 'components/TimeSeriesSearchSidebar';
import TimeSeriesTagSidebar from 'components/TimeSeriesTagSidebar';
import { BlueprintDefinition, TimeSeriesTag } from 'typings';
import { v4 as uuid } from 'uuid';
import { PRESET_COLORS } from 'consts';
import { AuthContext } from 'providers/AuthProvider';
import { useHistory, useParams } from 'react-router-dom';
import TopBar from 'components/TopBar';
import useFetchBlueprintDefinition from 'hooks/useQuery/useFetchBlueprintDefinitionQuery';
import StatusMessage from 'components/StatusMessage';
import useSaveBlueprintMutation from 'hooks/useMutation/useSaveBlueprintMutation';
import z from 'utils/z';
import {
  CogniteOrnate,
  getAnnotationsFromCDF,
  getFileFromCDF,
  OrnateExport,
} from 'ornate';
import { NavigationPanel } from 'components/NavigationPanel/NavigationPanel';
import { Legend } from 'components/Legend';

import useBlueprint from './useBlueprint';
import { FullScreenOverlay, PageWrapper, TopLeft, TopRight } from './elements';

const BlueprintPage: React.FC = () => {
  const { client, blueprintService } = useContext(AuthContext);
  const ornateViewer = useRef<CogniteOrnate>();
  const [blueprint, setBlueprint] = useState<BlueprintDefinition>();
  const [isMinimized, toggleMinimized] = useState(false);
  const [isNavigationActive, setIsNavigationActive] = useState(false);
  const [isCDFSidebarOpen, toggleCDFSidebar] = useState(false);
  const [isTimeSeriesSidebarOpen, toggleTimseriesSidebar] = useState(false);
  const [selectedTagId, setSelectedTagId] = useState<string>();

  const [disabledRuleSets, setDisabledRuleSets] = useState<
    Record<string, boolean>
  >({});
  const [isCreatingNewRuleSet, setIsCreatingNewRuleSet] = useState(false);
  const history = useHistory();
  const { externalId } = useParams<{ externalId: string }>();
  const { addFile } = useBlueprint(ornateViewer);
  const saveBlueprintMutation = useSaveBlueprintMutation();
  const { data, isLoading } = useFetchBlueprintDefinition(externalId);
  const { definition: blueprintDefinition, reference: blueprintReference } =
    data || {};
  const [shapes, setShapes] = useState<OrnateExport>();

  useEffect(() => {
    if (!blueprintDefinition) return;

    setBlueprint(blueprintDefinition);
    setShapes(blueprintDefinition.ornateShapes);
    if (
      ornateViewer.current &&
      blueprintDefinition.ornateShapes &&
      blueprintDefinition.ornateShapes.length > 0
    ) {
      ornateViewer.current.load(blueprintDefinition.ornateShapes, {
        fileUrl: {
          getURLFunc: getFileFromCDF(client),
          getAnnotationsFunc: getAnnotationsFromCDF(client),
        },
      });
    }
  }, [blueprintDefinition]);

  useEffect(() => {
    if (!externalId) {
      history.push('/');
    }
  }, [externalId]);

  const onSave = useCallback(
    async (nextBlueprint?: BlueprintDefinition) => {
      if (!nextBlueprint && !blueprint) return;
      const next: BlueprintDefinition = {
        ...((nextBlueprint || blueprint) as BlueprintDefinition),
        externalId,
        ornateShapes: ornateViewer.current!.export(),
      };
      saveBlueprintMutation.mutate(next);
    },
    [blueprint]
  );

  const onManualUploadFile = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();

    const newFile = await blueprintService!.uploadDiskFile(
      arrayBuffer,
      file.type,
      externalId
    );
    onFileClick(newFile);
  };

  const onAddTimeSeries = useCallback(
    (timeSeries: Timeseries) => {
      if (!blueprint) return;
      toggleTimseriesSidebar(false);
      let nextColor = PRESET_COLORS.filter((col) =>
        blueprint.timeSeriesTags.every((tag) => tag.color !== col.hex())
      ).shift();
      if (!nextColor) {
        nextColor =
          PRESET_COLORS[blueprint.timeSeriesTags.length % PRESET_COLORS.length];
      }
      const nextTag: TimeSeriesTag = {
        id: uuid(),
        timeSeriesReference: timeSeries.externalId
          ? {
              externalId: timeSeries.externalId,
            }
          : { id: timeSeries.id },
        tagPosition: { x: 100, y: 100 },
        pointerPosition: { x: 300, y: 300 },
        color: nextColor.hex(),
        rule: {
          type: 'LIMIT',
        },
      };
      setBlueprint({
        ...blueprint,
        timeSeriesTags: [...blueprint.timeSeriesTags, nextTag],
      });
    },
    [blueprint]
  );

  const onUpdateTimeSeriesTag = (update: Partial<TimeSeriesTag>) => {
    if (!blueprint) return;
    const nextBlueprintTimeseriesTags = blueprint.timeSeriesTags.map((tag) => {
      if (tag.id === selectedTagId) {
        return { ...tag, ...update };
      }
      return tag;
    });

    setBlueprint({
      ...blueprint,
      timeSeriesTags: nextBlueprintTimeseriesTags,
    });
  };

  const onFileClick = async (file: FileInfo) => {
    toggleCDFSidebar(false);
    addFile(file);
  };

  const onDeleteTag = (tagToDelete: TimeSeriesTag) => {
    if (!blueprint) return;

    setBlueprint({
      ...blueprint,
      timeSeriesTags: blueprint.timeSeriesTags.filter(
        (t) => t.id !== tagToDelete.id
      ),
    });
  };

  const selectedTag = useMemo(
    () =>
      (blueprint?.timeSeriesTags || []).find((tag) => tag.id === selectedTagId),
    [blueprint, selectedTagId]
  );

  return (
    <PageWrapper
      onKeyDown={(e) => {
        e.stopPropagation();
      }}
    >
      <TopBar
        title={blueprint?.name}
        subtitle={`by ${blueprint?.createdBy.email}`}
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: z.BLUEPRINT_PAGE_TOPBAR,
          background: 'white',
        }}
        onTitleChange={(nextTitle) => {
          if (!blueprint || blueprint.name === nextTitle) return;
          const nextBlueprint = {
            ...blueprint,
            name: nextTitle,
          };

          setBlueprint(nextBlueprint);
          onSave(nextBlueprint);
        }}
      />
      {isLoading && (
        <FullScreenOverlay>
          <StatusMessage type="Loading" message="Preparing your blueprint" />
        </FullScreenOverlay>
      )}
      {/* Navigation */}
      <TopLeft>
        <Button
          icon="Tree"
          onClick={() => setIsNavigationActive((prev) => !prev)}
        >
          Navigation
        </Button>
        <NavigationPanel
          isInfobarActive={isNavigationActive}
          ornateViewer={ornateViewer}
          shapes={shapes || []}
        />
      </TopLeft>

      {/* Edit & Add */}
      <TopRight>
        <Button
          icon={isMinimized ? 'Expand' : 'Collapse'}
          aria-label="Toggle minimized"
          onClick={() => toggleMinimized(!isMinimized)}
        >
          {isMinimized ? 'Maximize all' : 'Minimize all'}
        </Button>
        {blueprintReference &&
          blueprintService?.getAccessRights(blueprintReference) === 'WRITE' && (
            <Button
              onClick={() => onSave()}
              disabled={saveBlueprintMutation.isLoading}
            >
              Save
            </Button>
          )}
        <Dropdown
          content={
            <Menu>
              <Menu.Item onClick={() => toggleCDFSidebar(true)}>
                File from CDF
              </Menu.Item>
              <Menu.Item
                onClick={() => document.getElementById('fileElem')?.click()}
              >
                File from Disk
              </Menu.Item>
              <Menu.Divider />
              <Menu.Item onClick={() => toggleTimseriesSidebar(true)}>
                Time series
              </Menu.Item>
            </Menu>
          }
        >
          <Button type="primary" icon="Plus">
            Add
          </Button>
        </Dropdown>
        <input
          type="file"
          id="fileElem"
          accept="image/*,application/pdf"
          onChange={(e) => {
            if (e?.target.files?.length) {
              onManualUploadFile(e.target.files![0]);
            }
          }}
          style={{ position: 'absolute', left: -9999 }}
        />
      </TopRight>

      <FileSidebar
        visible={isCDFSidebarOpen}
        client={client}
        onToggle={toggleCDFSidebar}
        onFileClick={onFileClick}
      />

      <TimeSeriesSidebar
        visible={isTimeSeriesSidebarOpen}
        client={client}
        onClose={() => toggleTimseriesSidebar(false)}
        onAddTimeSeries={onAddTimeSeries}
      />

      <TimeSeriesTagSidebar
        visible={!!selectedTag}
        timeSeriesTag={selectedTag}
        onClose={() => setSelectedTagId(undefined)}
        onUpdateTimeSeriesTag={onUpdateTimeSeriesTag}
      />

      <Legend
        ruleSets={blueprint?.ruleSets || []}
        disabledRuleSets={disabledRuleSets}
        onChange={setDisabledRuleSets}
        onEdit={() => {
          setIsCreatingNewRuleSet(true);
        }}
      />

      {/* Interactive blueprint & toolbar */}
      <Blueprint
        client={client}
        blueprint={blueprint}
        onReady={(viewer) => {
          ornateViewer.current = viewer.current;
          ornateViewer.current?.stage.on(
            ornateViewer.current.SAVE_EVENT,
            () => {
              setShapes(ornateViewer.current?.export());
            }
          );
          setShapes(ornateViewer.current?.export());
        }}
        onUpdate={setBlueprint}
        onSelectTag={setSelectedTagId}
        onDeleteTag={onDeleteTag}
        isAllMinimized={isMinimized}
        disabledRulesets={disabledRuleSets}
        isRuleSetDrawerOpen={isCreatingNewRuleSet}
        setIsRuleSetDrawerOpen={setIsCreatingNewRuleSet}
      />
    </PageWrapper>
  );
};

export default BlueprintPage;
