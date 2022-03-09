import {
  CogniteOrnate,
  DefaultTool,
  LineTool,
  RectTool,
  OrnateTransformer,
  UpdateKeyType,
} from '@cognite/ornate';
import { CogniteClient } from '@cognite/sdk';
import OrnateTimeSeriesTag from 'components/TimeseriesTag/OrnateTimeSeriesTag';
import {
  MutableRefObject,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { BlueprintDefinition, TimeSeriesTag } from 'typings';
import { BlueprintToolbar } from 'components/BlueprintToolbar/BlueprintToolbar';
import { NodeConfig, Node } from 'konva/lib/Node';
import ContextMenu from 'components/ContextMenu';
import debounce from 'lodash/debounce';
import Konva from 'konva';

import { BlueprintWrapper } from './elements';

export type BlueprintProps = {
  client: CogniteClient;
  blueprint?: BlueprintDefinition;
  onUpdate?: (nextBlueprint: BlueprintDefinition) => void;
  onSelectTag?: (nextTagId: string) => void;
  onDeleteTag?: (tag: TimeSeriesTag) => void;
  onSelectNodes?: (nodes: Node<NodeConfig>[]) => void;
  onReady?: (viewer: MutableRefObject<CogniteOrnate | undefined>) => void;
  isAllMinimized?: boolean;
};

const Blueprint = ({
  client,
  blueprint,
  onUpdate,
  onSelectTag,
  onDeleteTag,
  onReady,
  isAllMinimized,
}: BlueprintProps) => {
  const ornateViewer = useRef<CogniteOrnate>();
  const [isReady, setIsReady] = useState(false);
  const [loadedBlueprint, setLoadedBlueprint] = useState<BlueprintDefinition>();
  const [activeTool, setActiveTool] = useState<string>('default');
  const [selectedNodes, setSelectedNodes] = useState<Node<NodeConfig>[]>([]);
  useEffect(() => {
    ornateViewer.current = new CogniteOrnate({
      container: '#ornate-container',
    });

    const ornateTransformer = new OrnateTransformer(ornateViewer.current);
    ornateViewer.current.transformer = ornateTransformer;
    ornateViewer.current.baseLayer.add(ornateViewer.current.transformer);
    ornateTransformer.onSelectNodes = (nodes) => {
      setSelectedNodes(nodes);
    };

    ornateViewer.current.tools = {
      default: new DefaultTool(ornateViewer.current),
      line: new LineTool(ornateViewer.current),
      rect: new RectTool(ornateViewer.current),
    };
    ornateViewer.current.currentTool = ornateViewer.current.tools.default;
    setIsReady(true);
    if (onReady) {
      onReady(ornateViewer);
    }
  }, []);

  const setTool = (tool: string) => {
    if (ornateViewer.current) {
      ornateViewer.current.currentTool = ornateViewer.current.tools[tool];
      setActiveTool(tool);
    }
  };

  useEffect(() => {
    if (blueprint && loadedBlueprint?.id !== blueprint.id) {
      setLoadedBlueprint(blueprint);
    }
  }, [blueprint, loadedBlueprint]);

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

  const onDeleteNode = useCallback(
    (node: Konva.Node) => {
      (ornateViewer.current?.tools.default as DefaultTool).onDelete();
      const docToDelete = ornateViewer.current?.documents.filter(
        (doc) => doc.group.id() === node.id()
      );
      if (docToDelete?.[0]) {
        ornateViewer.current?.removeDocument(docToDelete[0]);
      }
    },
    [ornateViewer, blueprint]
  );

  return (
    <BlueprintWrapper>
      <div id="ornate-container" />
      <div id="ornate-toolbar" />
      <BlueprintToolbar setActiveTool={setTool} activeTool={activeTool} />
      {isReady && selectedNodes.length > 0 && (
        <ContextMenu
          selectedNode={selectedNodes[0]}
          onDeleteNode={onDeleteNode}
          updateShape={updateShape}
        />
      )}
      {isReady &&
        blueprint?.timeSeriesTags.map((tag) => (
          <OrnateTimeSeriesTag
            key={tag.id}
            timeSeriesTag={tag}
            ornateViewer={ornateViewer}
            client={client}
            onChangeSettings={() => onSelectTag && onSelectTag(tag.id)}
            onDelete={() => onDeleteTag && onDeleteTag(tag)}
            isMinimized={isAllMinimized}
            onUpdate={(nextTag) => {
              if (onUpdate) {
                const nextBlueprint: BlueprintDefinition = {
                  ...blueprint,
                  timeSeriesTags: blueprint.timeSeriesTags.map((t) => {
                    if (t.id === tag.id) {
                      return nextTag;
                    }
                    return t;
                  }),
                };

                onUpdate(nextBlueprint);
              }
            }}
          />
        ))}
    </BlueprintWrapper>
  );
};

export default Blueprint;
