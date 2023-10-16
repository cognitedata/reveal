import { DEFAULT_VISIBILITY } from '@data-exploration/components';
import useLocalStorageState from 'use-local-storage-state';

import {
  FileTypeVisibility,
  InternalThreeDFilters,
  useTranslation,
} from '@data-exploration-lib/core';
import { use3DResults } from '@data-exploration-lib/domain-layer';

import { THREED_TABLE_ID } from '../constants';

import { CounterTab } from './elements';
import { getChipRightPropsForResourceCounter } from './getChipRightPropsForResourceCounter';
import { ResourceTabProps } from './types';

export const ThreeDTab = ({
  query,
  filter = {},
  ...rest
}: ResourceTabProps<InternalThreeDFilters>) => {
  const { t } = useTranslation();
  const [fileTypeVisibility] = useLocalStorageState<FileTypeVisibility>(
    `${THREED_TABLE_ID}-file-types`,
    {
      defaultValue: DEFAULT_VISIBILITY,
    }
  );

  const { count, isFetching } = use3DResults(fileTypeVisibility, query, filter);

  const chipRightProps = getChipRightPropsForResourceCounter(count, isFetching);

  return <CounterTab label={t('3D', '3D')} {...chipRightProps} {...rest} />;
};
