import { useEffect } from 'react';

import {
  RulesetDraft,
  RulesetDto,
  useCreateRulesets,
  useListByIdsRulesets,
} from '@data-quality/api/codegen';
import { useLoadDataSource } from '@data-quality/hooks';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';

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
    isLoading: rulesetsLoading,
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
  } = useCreateRulesets();

  const isLoading = rulesetsLoading || createRulesetsLoading || dsLoading;

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
    if (dsLoading) return;

    if (!dataSource?.externalId) {
      Notification({
        type: 'error',
        message: t(
          'data_quality_error_ruleset_create',
          'Something went wrong. Can not create a ruleset without datasource.'
        ),
        errors: `Data source id is "${dataSource?.externalId}". Ruleset id is "${ruleset?.externalId}"`,
        options: { position: 'bottom-left' },
      });

      return;
    }

    const loadRuleset = async () => {
      const response = await refetch();
      const rulesetFound = response.data?.items[0];

      if (rulesetFound) return;

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
          { onSuccess: () => refetch() }
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
