import {
  RuleCreateDraft,
  RuleDto,
  RuleUpdateItem,
  useCreateRules,
  useUpdateRules,
} from '@data-quality/api/codegen';
import { useLoadDataSource, useLoadRules } from '@data-quality/hooks';
import { getDefaultRulesetId } from '@data-quality/utils/namingPatterns';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { isEqual } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { RuleFormValues } from '../helpers';

import { useLoadRuleset } from './useLoadRuleset';

type UpsertRuleOptions = {
  editedRule?: RuleDto;
  onSuccess: VoidFunction;
  values: RuleFormValues;
};

/** Create or update a rule with the given values.
 *
 * The rule will be stored in a "default" ruleset but the hook can be extended in the future
 * to also specify which ruleset the rule should be part of.*/
export const useUpsertRule = () => {
  const { t } = useTranslation('useUpsertRule');

  const { dataSource } = useLoadDataSource();
  const { refetchRules } = useLoadRules();

  // Use a default ruleset for now
  const rulesetId = getDefaultRulesetId(dataSource?.externalId);
  const { ruleset } = useLoadRuleset({ rulesetId: rulesetId });

  const { isLoading: createRulesLoading, mutateAsync: createRuleMutation } =
    useCreateRules({ mutationKey: ['createRules'] });
  const { isLoading: updateRulesLoading, mutateAsync: updateRuleMutation } =
    useUpdateRules({ mutationKey: ['updateRules'] });

  const isLoading = createRulesLoading || updateRulesLoading;

  const upsertRule = async ({
    editedRule,
    onSuccess,
    values,
  }: UpsertRuleOptions) => {
    if (!dataSource || !ruleset) {
      Notification({
        type: 'error',
        message: t('data_quality_error_upsert', '', { target: 'rule' }),
        errors: `Data source id is "${dataSource?.externalId}". Ruleset id is "${ruleset?.externalId}"`,
        options: { position: 'bottom-left' },
      });

      return;
    }

    const handleSuccess = () => {
      onSuccess();
      refetchRules();
    };

    try {
      // Create a rule
      if (!editedRule) {
        const newRule: RuleCreateDraft = {
          externalId: uuidv4(),
          ...values,
        };

        await createRuleMutation(
          {
            body: { items: [newRule] },
            pathParams: {
              dataSourceId: dataSource.externalId,
              rulesetId,
            },
          },
          {
            onSuccess: handleSuccess,
          }
        );
      }

      // Update a rule
      else {
        const noChanges = compareChanges(values, editedRule);

        if (noChanges) {
          Notification({
            type: 'info',
            message: t(
              'data_quality_upsert_no_changes',
              'No changes to be updated were found.'
            ),
            options: { position: 'bottom-left' },
          });

          return;
        }

        const updatedRule: RuleUpdateItem = {
          externalId: editedRule.externalId,
          update: { ...values },
        };

        await updateRuleMutation(
          {
            body: { items: [updatedRule] },
            pathParams: {
              dataSourceId: dataSource.externalId,
              rulesetId,
            },
          },
          {
            onSuccess: handleSuccess,
          }
        );
      }
    } catch (err: any) {
      const message = editedRule
        ? 'data_quality_error_update'
        : 'data_quality_error_create';

      Notification({
        type: 'error',
        message: t(message, '', { target: 'rule' }),
        errors: JSON.stringify(err?.stack?.error),
        options: { position: 'bottom-left' },
      });
    }
  };

  return { isLoading, upsertRule };
};

/** Check if there have been no changes when editing a rule */
const compareChanges = (updatedValues: RuleFormValues, editedRule: RuleDto) => {
  const updatedRule = {
    externalId: editedRule.externalId,
    ...updatedValues,
  };

  return isEqual(updatedRule, editedRule);
};
