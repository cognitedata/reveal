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
import { NodeConfig, Node } from 'konva/lib/Node';
import { Drawer } from '@cognite/cogs.js';
import { RuleSetsDrawer } from 'components/RuleSetDrawer/RuleSetsDrawer';
import { useQueries } from 'react-query';
import { resolveAttributeValue } from 'models/rulesEngine/api';
import { compileExpression } from 'filtrex';
import { useAuthContext } from '@cognite/react-container';
import { CogniteOrnate, defaultColor, ToolNodeStyle, ToolType } from 'ornate';
import { Ornate } from 'ornate/react';
import { NodeStyle, StyleSelector, Toolbar } from 'ornate/react/components';
import BaseAttributesControl from 'components/ContextMenu/ContextMenuItems/AttributesControl';
import { ControlProps } from 'ornate/react/components/context-menu/controls';

import { BlueprintWrapper } from './elements';
import { BaseRuleControl } from './RuleControl/RuleControl';

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

const DEFAULT_STYLE: NodeStyle = {
  fill: defaultColor.rgb().string(),
  stroke: defaultColor.alpha(1).rgb().string(),
  strokeWidth: 12,
  fontSize: '18',
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
  const [activeStyle, setActiveStyle] = useState(DEFAULT_STYLE);
  const [isReady, setIsReady] = useState(false);
  const [loadedBlueprint, setLoadedBlueprint] = useState<BlueprintDefinition>();
  const [activeTool, setActiveTool] = useState<ToolType>('HAND');
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
    if (blueprint && loadedBlueprint?.id !== blueprint.id) {
      setLoadedBlueprint(blueprint);
    }
  }, [blueprint, loadedBlueprint]);
  const handleStyleChange = (nextStyle: ToolNodeStyle) => {
    if (ornateViewer.current) {
      ornateViewer.current.style = nextStyle;
    }
    setActiveStyle({ ...activeStyle, ...nextStyle });
  };

  const getSecondaryToolbar = () => {
    if (['CIRCLE', 'LINE', 'RECT', 'TEXT'].includes(activeTool)) {
      const style = { ...activeStyle };
      if (['CIRCLE', 'RECT'].includes(activeTool)) {
        delete style.fontSize;
      }
      if (activeTool === 'LINE') {
        delete style.fill;
        delete style.fontSize;
      }
      if (activeTool === 'TEXT') {
        delete style.stroke;
        delete style.strokeWidth;
      }
      return <StyleSelector style={style} onChange={handleStyleChange} />;
    }
    return null;
  };

  const RuleControl: React.FC<ControlProps> = useCallback(
    ({ nodes }) => {
      return (
        <BaseRuleControl
          ruleSets={blueprint?.ruleSets}
          shapeRuleSetsIds={blueprint?.shapeRuleSets?.[nodes[0].id()] || []}
          onNewRuleSet={() => {
            setIsCreatingNewRuleSet(true);
          }}
          onClickRuleSet={(nextRuleSetId: string) => {
            if (onUpdate && blueprint) {
              const currentSelectedRuleSetsForShape =
                blueprint?.shapeRuleSets?.[nodes[0].id()] || [];
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
                shapeRuleSets: nodes.reduce(
                  (acc, node) => ({
                    ...acc,
                    [node.id()]: nextRulesForShape,
                  }),
                  blueprint.shapeRuleSets
                ),
              };

              onUpdate(nextBlueprint);
            }
          }}
        />
      );
    },
    [blueprint]
  );

  const AttributeControl: React.FC<ControlProps> = useCallback(
    ({ nodes }) => {
      return (
        <BaseAttributesControl
          attributes={blueprint?.shapeAttributes?.[nodes[0].id()] || []}
          onChange={(nextAttributes) => {
            if (onUpdate && blueprint) {
              const nextBlueprint: BlueprintDefinition = {
                ...blueprint,
                shapeAttributes: nodes.reduce(
                  (acc, node) => ({
                    ...acc,
                    [node.id()]: nextAttributes,
                  }),
                  blueprint?.shapeAttributes || {}
                ),
              };

              onUpdate(nextBlueprint);
            }
          }}
        />
      );
    },
    [blueprint]
  );

  return (
    <BlueprintWrapper>
      <Ornate
        shapes={[]}
        activeTool={activeTool}
        onReady={(instance) => {
          ornateViewer.current = instance;
          setIsReady(true);
          if (onReady) {
            onReady(ornateViewer);
          }
        }}
        contextMenuProps={{
          additionalControls: (shapeTypes) =>
            shapeTypes.some((type) => ['CIRCLE', 'RECT', 'LINE'].includes(type))
              ? [RuleControl, AttributeControl]
              : [],
        }}
      />
      <Toolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        tools={[
          'HAND',
          'SELECT',
          'DIVIDER',
          'RECT',
          'CIRCLE',
          'PATH',
          'LINE',
          'TEXT',
        ]}
        secondaryToolbar={getSecondaryToolbar()}
      />
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
