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
import {
  BlueprintDefinition,
  ShapeAttribute,
  TimeSeriesTag,
  Rule,
  RuleOutput,
  RuleSet,
} from 'typings';
import { BlueprintToolbar } from 'components/BlueprintToolbar/BlueprintToolbar';
import { NodeConfig, Node } from 'konva/lib/Node';
import ContextMenu from 'components/ContextMenu';
import debounce from 'lodash/debounce';
import Konva from 'konva';
import { Drawer } from '@cognite/cogs.js';
import { RuleSetsDrawer } from 'components/RuleSetDrawer/RuleSetsDrawer';
import { useQueries } from 'react-query';
import { resolveAttributeValue } from 'models/rulesEngine/api';
import { compileExpression } from 'filtrex';
import { useAuthContext } from '@cognite/react-container';

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

const evaluateRuleSet = async (
  client: CogniteClient,
  ruleSet: RuleSet,
  shapeAttributes: ShapeAttribute[]
) => {
  const evaluatedRules = await Promise.all(
    ruleSet.rules.map((rule) => evaluateRule(client, rule, shapeAttributes))
  );
  return Object.assign({}, ...evaluatedRules);
};

const evaluateRule = async (
  client: CogniteClient,
  rule: Rule<RuleOutput>,
  shapeAttributes: ShapeAttribute[]
): Promise<RuleOutput> => {
  const { expression } = rule;
  if (!expression) return {};
  // For some early alpha version debugging
  // eslint-disable-next-line no-console
  console.log('- EVALUATING RULE: ----', rule);
  const shapeAttributesInExpression =
    shapeAttributes.filter((x: ShapeAttribute) =>
      expression.includes(x.name)
    ) || [];

  const resolvedShapeAttributesPromises = shapeAttributesInExpression.map(
    (attr) =>
      resolveAttributeValue(client!, attr).then((res) => ({
        name: attr.name,
        value: res,
      }))
  );
  const resolvedAttributes = await Promise.all(resolvedShapeAttributesPromises);
  const attributes = resolvedAttributes.reduce(
    (acc, item) => ({
      ...acc,
      [item.name]: item.value,
    }),
    {}
  );

  const evalFunc = compileExpression(expression);
  const result = evalFunc(attributes);
  // For some early alpha version debugging
  // eslint-disable-next-line no-console
  console.log('--- RESOLUTION', attributes, expression, result);
  if (result) {
    return rule.output;
  }
  return {};
};

const useRuleSetEvaluation = (
  blueprint?: BlueprintDefinition,
  onSuccess?: (shapeKey: string, output: RuleOutput) => void,
  onError?: (shapeKey: string, error: string) => void
) => {
  const { ruleSets = [], shapeRuleSets, shapeAttributes } = blueprint || {};
  const { client } = useAuthContext();

  return useQueries(
    Object.keys(shapeRuleSets || {}).map((shapeKey) => ({
      queryKey: ['ruleEval', shapeKey],
      queryFn: async () => {
        if (!client) return {};
        const expandedRuleSets = (shapeRuleSets?.[shapeKey] || [])
          .map((id) => ruleSets.find((r) => r.id === id))
          .filter(Boolean) as RuleSet[];

        const evaluatedRuleSets = await Promise.all(
          (expandedRuleSets || []).map((ruleSet) =>
            evaluateRuleSet(client, ruleSet, shapeAttributes?.[shapeKey] || [])
          )
        );

        return Object.assign({}, ...evaluatedRuleSets);
      },
      onSuccess: (result: RuleOutput) => {
        if (onSuccess) {
          onSuccess(shapeKey, result);
        }
      },
      onError: (err: Error) => {
        if (onError) {
          onError(shapeKey, err.message);

          // For some early alpha version debugging
          // eslint-disable-next-line no-console
          console.error(err);
        }
      },
      retry: false,
      refetchInterval: 10000,
    }))
  );
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
  const [isCreatingNewRuleSet, setIsCreatingNewRuleSet] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const queriesResults = useRuleSetEvaluation(
    blueprint,
    (shapeKey, result) => {
      setErrors((prev) => ({
        ...prev,
        [shapeKey]: undefined,
      }));
      if (ornateViewer.current) {
        ornateViewer.current.stage.find(`#${shapeKey}`).forEach((shape) => {
          shape.setAttrs(result);
        });
      }
    },
    (shapeKey, error) => {
      setErrors((prev) => ({
        ...prev,
        [shapeKey]: error,
      }));
    }
  );

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
          shapeAttributes={
            blueprint?.shapeAttributes?.[selectedNodes[0].id()] || []
          }
          onSetShapeAttributes={(nextAttributes) => {
            if (onUpdate && blueprint) {
              const nextBlueprint: BlueprintDefinition = {
                ...blueprint,
                shapeAttributes: {
                  ...(blueprint?.shapeAttributes || {}),
                  [selectedNodes[0].id()]: nextAttributes,
                },
              };

              onUpdate(nextBlueprint);
            }
          }}
          ruleSets={blueprint?.ruleSets}
          shapeRuleSetsIds={
            blueprint?.shapeRuleSets?.[selectedNodes[0].id()] || []
          }
          onNewRuleSet={() => {
            setIsCreatingNewRuleSet(true);
          }}
          onClickRuleSet={(nextRuleSetId: string) => {
            if (onUpdate && blueprint) {
              const currentSelectedRuleSetsForShape =
                blueprint?.shapeRuleSets?.[selectedNodes[0].id()] || [];
              let nextRulesForShape = [...currentSelectedRuleSetsForShape];
              if (currentSelectedRuleSetsForShape.includes(nextRuleSetId)) {
                nextRulesForShape = nextRulesForShape.filter(
                  (x) => x !== nextRuleSetId
                );
              } else {
                nextRulesForShape = nextRulesForShape.concat(nextRuleSetId);
              }
              const nextBlueprint: BlueprintDefinition = {
                ...blueprint,
                shapeRuleSets: {
                  ...(blueprint.shapeRuleSets || {}),
                  [selectedNodes[0].id()]: nextRulesForShape,
                },
              };

              onUpdate(nextBlueprint);
            }
          }}
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
      <Drawer
        visible={isCreatingNewRuleSet}
        width={360}
        onClose={() => {
          setIsCreatingNewRuleSet(false);
        }}
      >
        <RuleSetsDrawer
          ruleSets={blueprint?.ruleSets || []}
          issues={errors}
          onIssueClick={(shapeKey) => {
            ornateViewer.current?.zoomToNode(
              ornateViewer.current.stage.find(`#${shapeKey}`)[0]
            );
          }}
          onDeleteRuleSet={(ruleSet) => {
            if (!blueprint || !onUpdate) return;
            const nextRuleSets = blueprint.ruleSets?.filter(
              (r) => r.id !== ruleSet.id
            );
            const nextShapeRuleSets = { ...blueprint.shapeRuleSets };
            Object.keys(nextShapeRuleSets).forEach((shapeKey) => {
              nextShapeRuleSets[shapeKey] = nextShapeRuleSets[shapeKey].filter(
                (r) => r !== ruleSet.id
              );
              if (nextShapeRuleSets[shapeKey].length === 0) {
                delete nextShapeRuleSets[shapeKey];
              }
            });
            const nextBlueprint: BlueprintDefinition = {
              ...blueprint,
              ruleSets: nextRuleSets,
              shapeRuleSets: nextShapeRuleSets,
            };
            onUpdate(nextBlueprint);
          }}
          onUpdateRuleSets={(next) => {
            if (!blueprint || !onUpdate) return;

            const nextBlueprint: BlueprintDefinition = {
              ...blueprint,
              ruleSets: next,
            };
            onUpdate(nextBlueprint);
            queriesResults.forEach((query) => query.refetch());
          }}
        />
      </Drawer>
    </BlueprintWrapper>
  );
};

export default Blueprint;
