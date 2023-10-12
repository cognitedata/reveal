import { useEffect } from 'react';

import { Notification } from '../../../../../../components/Notification/Notification';
import { useTranslation } from '../../../../../../hooks/useTranslation';
import { queryClient } from '../../../../../../queryClient';
import {
  RulesetDraft,
  RulesetDto,
  useCreateRulesets,
  useListByIdsRulesets,
} from '../../../api/codegen';
import { useLoadDataSource } from '../../../hooks';

type LoadRulesetOptions = {
  rulesetId: string;
};

/** Try to load an existing ruleset by its id, or create a new ruleset with the given id. */
export const useLoadRuleset = ({ rulesetId }: LoadRulesetOptions) => {
  const { t } = useTranslation('useLoadRuleset');

  const { dataSource, isLoading: dsLoading } = useLoadDataSource();

  const {
    data: rulesetsData,
    error: rulesetsError,
    isRefetching,
    refetch,
  } = useListByIdsRulesets(
    {
      body: { items: [{ externalId: rulesetId }] },
      pathParams: { dataSourceId: dataSource?.externalId },
    },
    { enabled: false }
  );

  const {
    isLoading: createRulesetsLoading,
    mutateAsync: createRulesetsMutation,
  } = useCreateRulesets({ mutationKey: ['createRulesets'] });

  const isLoading = createRulesetsLoading || dsLoading || isRefetching;

  if (rulesetsError) {
    Notification({
      type: 'error',
      message: t(
        'data_quality_error_ruleset_byids',
        `Something went wrong. Can not fetch the ruleset with id "${rulesetId}".`,
        { rulesetId }
      ),
      errors: JSON.stringify(rulesetsError),
      options: { position: 'bottom-left' },
    });
  }

  useEffect(() => {
    const loadRuleset = async () => {
      if (isLoading) return;

      if (!dataSource) return;

      const response = await refetch();
      const rulesetFound = response.data?.items[0];

      if (rulesetFound) return;

      // Check if the creatingRuleset mutation is in use; refetch might be slow to catch up
      const creatingRuleset = queryClient.isMutating({
        mutationKey: ['createRulesets'],
      });
      if (creatingRuleset) return;

      const newRuleset: RulesetDraft = {
        externalId: rulesetId,
        name: 'Default ruleset',
      };

      // No ruleset found, try to create it
      try {
        createRulesetsMutation(
          {
            body: { items: [newRuleset] },
            pathParams: { dataSourceId: dataSource?.externalId },
          },
          { onSuccess: async () => await refetch() }
        );
      } catch (err: any) {
        Notification({
          type: 'error',
          message: t(
            'data_quality_not_found_ruleset',
            `Something went wrong. The ruleset ${rulesetId} could not be loaded.`,
            { rulesetId }
          ),
          errors: JSON.stringify(err?.stack?.error),
        });
      }
    };

    loadRuleset();
  }, [dataSource?.externalId]);

  const ruleset = findRuleset(rulesetId, rulesetsData?.items);

  return { isLoading, ruleset };
};

/** Looks for a ruleset that matches the given id in a list of rulesets. */
const findRuleset = (rulesetId: string, rulesets?: RulesetDto[]) =>
  rulesets?.find((rs) => rs.externalId === rulesetId);
