import uniq from 'lodash/uniq';
import { useQuery } from 'react-query';
import { compileExpression } from 'filtrex';
import { useAuthContext } from '@cognite/react-container';
import {
  BlueprintDefinition,
  ShapeAttribute,
  RuleOutput,
  RuleSet,
} from 'typings';

export const useRuleSetEvaluation = (
  blueprint?: BlueprintDefinition,
  onSuccess?: (shapeKey: string, output: RuleOutput) => void,
  onError?: (shapeKey: string, error: string) => void
) => {
  const { ruleSets = [], shapeRuleSets, shapeAttributes } = blueprint || {};
  const { client } = useAuthContext();

  const assetAttributes = Object.values(shapeAttributes || {})
    .flat()
    .filter((x) => x.type === 'ASSET');

  const tsAttributes = Object.values(shapeAttributes || {})
    .flat()
    .filter((x) => x.type === 'TIMESERIES');

  return useQuery(
    ['all-assets', assetAttributes, tsAttributes],
    async () => {
      const assets = client!.assets.retrieve(
        uniq(assetAttributes.map((x) => x.externalId)).map((externalId) => ({
          externalId,
        }))
      );
      const timeseries = client!.timeseries.retrieve(
        uniq(tsAttributes.map((x) => x.externalId)).map((externalId) => ({
          externalId,
        }))
      );
      const datasets = client!.datapoints.retrieveLatest(
        uniq(tsAttributes.map((x) => x.externalId)).map((externalId) => ({
          externalId,
        }))
      );
      const results = await Promise.all([assets, timeseries, datasets]);
      return {
        assets: results[0],
        timeseries: results[1],
        datapoints: results[2],
      };
    },
    {
      refetchInterval: 10000,
      onSuccess: (attrData) => {
        const result = Object.keys(shapeRuleSets || {}).map((shapeKey) => {
          const errors: string[] = [];
          const expandedRuleSets = (shapeRuleSets?.[shapeKey] || [])
            .map((id) => ruleSets.find((r) => r.id === id))
            .filter(Boolean) as RuleSet[];

          const ruleSetOutputs = (expandedRuleSets || []).map((ruleSet) => {
            const allRulesOutput = ruleSet.rules.map((rule) => {
              // For some early alpha version debugging
              // eslint-disable-next-line no-console
              console.log('- EVALUATING RULE: ----', rule);
              const shapeAttributesInExpression =
                shapeAttributes?.[shapeKey].filter((x: ShapeAttribute) =>
                  rule.expression.includes(x.name)
                ) || [];
              const relevantData = shapeAttributesInExpression.map((attr) => {
                if (attr.type === 'ASSET') {
                  const asset = attrData.assets.find(
                    (a) => a.externalId === attr.externalId
                  );
                  if (attr.extractor === 'METADATA' && attr.subExtractor) {
                    return {
                      ...attr,
                      value: asset?.metadata?.[attr.subExtractor],
                    };
                  }
                }

                if (attr.type === 'TIMESERIES') {
                  if (attr.extractor === 'CURRENT_VALUE') {
                    const value = attrData.datapoints.find(
                      (a) => a.externalId === attr.externalId
                    )?.datapoints[0].value;
                    return { ...attr, value };
                  }
                  if (attr.extractor === 'METADATA' && attr.subExtractor) {
                    const value = attrData.timeseries.find(
                      (a) => a.externalId === attr.externalId
                    )?.metadata?.[attr.subExtractor];
                    return { ...attr, value };
                  }
                }
                return null;
              });

              const attributes = relevantData.reduce(
                (acc, item) =>
                  item
                    ? {
                        ...acc,
                        [item.name]: item.value,
                      }
                    : acc,
                {}
              );
              try {
                const evalFunc = compileExpression(rule.expression);
                const result: boolean = evalFunc(attributes);
                // For some early alpha version debugging
                // eslint-disable-next-line no-console
                console.log(
                  '--- RESOLUTION',
                  attributes,
                  rule.expression,
                  result
                );
                if (result) {
                  return rule.output;
                }
                return {};
              } catch (e: any) {
                console.log('an error happened', e.message);
                errors.push(e.message);
                return {};
              }
            });
            return Object.assign({}, ...allRulesOutput) as RuleOutput;
          });

          return {
            shapeKey,
            output: Object.assign({}, ...ruleSetOutputs) as RuleOutput,
            errors,
          };
        });
        result.forEach((x) => {
          if (x.errors && x.errors.length > 0 && onError) {
            x.errors.forEach((error) => {
              onError(x.shapeKey, error);
            });
          } else if (onSuccess) {
            onSuccess(x.shapeKey, x.output);
          }
        });
      },
    }
  );
};
