import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Tooltip } from '@cognite/cogs.js';

import { getOverflownElementsInfo } from '_helpers/getOverflownElementsInfo';
import { Label } from 'components/tmp-label';
import { useDocumentAssetNames } from 'hooks/useDocumentAssetNames';
import { FlexColumn } from 'styles/layout';

import {
  DocumentAssetNamesContainer,
  DocumentAssetNone,
  DocumentAssetsContainer,
  DocumentAssetsHeader,
  DocumentAssetsHiddenCount,
} from './elements';

export interface Props {
  assetIds: number[] | undefined;
}

const HIDDEN_COUNT_ID = 'hidden-count';
const LOADING_TEXT = 'Fetching assets…';
const NONE_TEXT = 'None';

export const DocumentAssets: React.FC<Props> = ({ assetIds = [] }) => {
  const { t } = useTranslation('Documents');

  const [lastElementOffset, setLastElementOffset] = useState(0);
  const [lastElementIndex, setLastElementIndex] = useState(0);

  const ref = useRef<HTMLDivElement | null>(null);

  const { data: assetNames = [], isFetching } = useDocumentAssetNames(assetIds);

  useEffect(() => {
    const { lastOffset, lastIndex } = getOverflownElementsInfo(ref, [
      HIDDEN_COUNT_ID,
    ]);
    setLastElementOffset(lastOffset);
    setLastElementIndex(lastIndex);
  }, [ref, assetNames]);

  const hiddenCount = assetNames.length - lastElementIndex - 1;

  const hiddenNames = assetNames
    .filter((_, index) => index > lastElementIndex)
    .map((name) => <div key={`doc_hidden_asset_${name}`}>{name}</div>);

  return (
    <DocumentAssetsContainer>
      <FlexColumn>
        <DocumentAssetsHeader>{t('Assets')}</DocumentAssetsHeader>
        <DocumentAssetNamesContainer ref={ref}>
          {isFetching && LOADING_TEXT}
          {!isFetching && assetNames.length === 0 && (
            <DocumentAssetNone>{NONE_TEXT}</DocumentAssetNone>
          )}
          {assetNames?.map((name) => (
            <Label key={`doc_asset_${name}`}>{`${name}`}</Label>
          ))}
          {hiddenCount > 0 && (
            <DocumentAssetsHiddenCount
              id={HIDDEN_COUNT_ID}
              left={lastElementOffset}
            >
              <Tooltip content={hiddenNames}>
                <>+{hiddenCount}</>
              </Tooltip>
            </DocumentAssetsHiddenCount>
          )}
        </DocumentAssetNamesContainer>
      </FlexColumn>
    </DocumentAssetsContainer>
  );
};
