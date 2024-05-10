/*!
 * Copyright 2024 Cognite AS
 */
import { useState, type ReactElement } from 'react';

import { Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { use3dModels } from '../../hooks/use3dModels';
import { useAssetMappedNodesForRevisions } from '../CacheProvider/AssetMappingCacheProvider';
import { type CadModelOptions } from '../Reveal3DResources/types';

type AssetContextualizedButtonProps = {
  setEnableCustomDefaultStyling: (enabled: boolean) => void;
};

export const AssetContextualizedButton = ({
  setEnableCustomDefaultStyling
}: AssetContextualizedButtonProps): ReactElement => {
  const { t } = useTranslation();
  const models = use3dModels();
  const cadModels = models.filter((model) => model.type === 'cad') as CadModelOptions[];
  const [enableContextualizedStyling, setEnableContextualizedStyling] = useState<boolean>(false);
  const { isLoading } = useAssetMappedNodesForRevisions(cadModels);

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

  const tooltip = isLoading ? tooltipMapping.true : tooltipMapping.false;

  const onClick = (): void => {
    setEnableContextualizedStyling((prevState) => !prevState);
    setEnableCustomDefaultStyling(!enableContextualizedStyling);
  };

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
