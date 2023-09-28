import {
  DataScopeCreateDraft,
  DataScopeDto,
  DataScopeUpdateItem,
  useCreateDataScopes,
  useUpdateDataScopes,
} from '@data-quality/api/codegen';
import { useLoadDataSource, useLoadDataScopes } from '@data-quality/hooks';
import { Notification } from '@platypus-app/components/Notification/Notification';
import { useTranslation } from '@platypus-app/hooks/useTranslation';
import { isEqual } from 'lodash';
import { v4 as uuidv4 } from 'uuid';

import { DataScopeFormValues } from '../helpers';

type UpsertDataScopeOptions = {
  editedDataScope?: DataScopeDto;
  onSuccess: VoidFunction;
  values: DataScopeFormValues;
};

/** Create or update a data scope with the given values. */
export const useUpsertDataScope = () => {
  const { t } = useTranslation('useUpsertDataScope');

  const { dataSource } = useLoadDataSource();
  const { refetch } = useLoadDataScopes();

  const {
    isLoading: createDataScopesLoading,
    mutateAsync: createDataScopeMutation,
  } = useCreateDataScopes({ mutationKey: ['createDataScopes'] });
  const {
    isLoading: updateDataScopesLoading,
    mutateAsync: updateDataScopeMutation,
  } = useUpdateDataScopes({ mutationKey: ['updateDataScopes'] });

  const isLoading = createDataScopesLoading || updateDataScopesLoading;

  const upsertDataScope = async ({
    editedDataScope,
    onSuccess,
    values,
  }: UpsertDataScopeOptions) => {
    if (!dataSource) {
      Notification({
        type: 'error',
        message: t('data_quality_error_upsert', '', { target: 'data scope' }),
        options: { position: 'bottom-left' },
      });

      return;
    }

    const handleSuccess = () => {
      onSuccess();
      refetch();
    };

    try {
      // Create a Data Scope
      if (!editedDataScope) {
        const newDataScope: DataScopeCreateDraft = {
          externalId: uuidv4(),
          ...values,
        };

        await createDataScopeMutation(
          {
            body: { items: [newDataScope] },
            pathParams: { dataSourceId: dataSource.externalId },
          },
          {
            onSuccess: handleSuccess,
          }
        );
        // }
      }

      // Update a Data Scope
      else {
        const noChanges = compareChanges(values, editedDataScope);

        if (noChanges) {
          Notification({
            type: 'info',
            message: t('data_quality_upsert_no_changes', ''),
            options: { position: 'bottom-left' },
          });

          return;
        }

        const updatedDataScope: DataScopeUpdateItem = {
          externalId: editedDataScope.externalId,
          update: { ...values },
        };

        await updateDataScopeMutation(
          {
            body: { items: [updatedDataScope] },
            pathParams: { dataSourceId: dataSource.externalId },
          },
          {
            onSuccess: handleSuccess,
          }
        );
      }
    } catch (err: any) {
      const message = editedDataScope
        ? 'data_quality_error_update'
        : 'data_quality_error_create';

      Notification({
        type: 'error',
        message: t(message, '', { target: 'data scope' }),
        errors: JSON.stringify(err?.stack?.error),
        options: { position: 'bottom-left' },
      });
    }
  };

  return { isLoading, upsertDataScope };
};

/** Check if there have been no changes when editing a data scope */
const compareChanges = (
  updatedValues: DataScopeFormValues,
  editedDataScope: DataScopeDto
) => {
  const updatedDataScope = {
    externalId: editedDataScope.externalId,
    ...updatedValues,
  };

  return isEqual(updatedDataScope, editedDataScope);
};
