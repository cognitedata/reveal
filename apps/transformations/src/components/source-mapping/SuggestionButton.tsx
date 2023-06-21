import { useState } from 'react';

import { useTranslation } from '@transformations/common';
import { TransformationRead } from '@transformations/types';

import { Button } from '@cognite/cogs.js';

import { useSuggestions } from './hooks';
import SuggestionModal from './SuggestionModal';

type Props = { transformation: TransformationRead };
export default function SuggestionButton({ transformation }: Props) {
  const { t } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);

  const { data: suggestions, isInitialLoading } =
    useSuggestions(transformation);

  return (
    <>
      {modalVisible && (
        <SuggestionModal
          closeModal={() => setModalVisible(false)}
          transformation={transformation}
        />
      )}

      <Button
        disabled={isInitialLoading || suggestions?.length === 0}
        icon={isInitialLoading ? 'Loader' : 'LightBulb'}
        onClick={() => {
          setModalVisible(true);
        }}
      >
        {isInitialLoading
          ? t('source-view-suggestions-loading')
          : t('source-view-suggestions', {
              count: suggestions?.length || 0,
            })}
      </Button>
    </>
  );
}
