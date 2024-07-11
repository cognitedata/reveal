/*!
 * Copyright 2024 Cognite AS
 */
import { useCallback, useState, type ReactElement } from 'react';

import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { use3dModels } from '../../hooks/use3dModels';
import { useAssetMappedNodesForRevisions } from '../CacheProvider/AssetMappingAndNode3DCacheProvider';
import { type CadModelOptions } from '../Reveal3DResources/types';

type AssetContextualizedButtonProps = {
  setEnableMappedStyling: (enabled: boolean) => void;
};

const tooltipMapping = {
  true: {
    key: 'CONTEXTUALIZED_ASSETS_LOADING_TOOLTIP',
    default: 'Loading contextualized assets'
  },
  false: {
    key: 'CONTEXTUALIZED_ASSETS_TOOLTIP',
    default: 'Show contextualized assets'
  }
};

export const AssetContextualizedButton = ({
  setEnableMappedStyling
}: AssetContextualizedButtonProps): ReactElement => {
  const { t } = useTranslation();
  const models = use3dModels();
  const cadModels = models.filter((model) => model.type === 'cad') as CadModelOptions[];
  const [enableContextualizedStyling, setEnableContextualizedStyling] = useState<boolean>(false);
  const { isLoading } = useAssetMappedNodesForRevisions(cadModels);

  const tooltip = isLoading ? tooltipMapping.true : tooltipMapping.false;

  const onClick = useCallback((): void => {
    setEnableContextualizedStyling((prevState) => !prevState);
    setEnableMappedStyling(!enableContextualizedStyling);
  }, [enableContextualizedStyling, setEnableMappedStyling]);

  return (
    <CogsTooltip
      content={t(tooltip.key, tooltip.default)}
      placement="right"
      appendTo={document.body}>
      <Button
        type="ghost"
        icon="Assets"
        toggled={enableContextualizedStyling}
        aria-label="asset-labels-button"
        onClick={onClick}
        disabled={isLoading}
      />
    </CogsTooltip>
  );
};
