/*!
 * Copyright 2024 Cognite AS
 */
import { useCallback, useState, type ReactElement } from 'react';

import { AssetsIcon, Button, Tooltip as CogsTooltip } from '@cognite/cogs.js';
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
  const { isLoading, isFetched } = useAssetMappedNodesForRevisions(cadModels);
  const disabled = isLoading && !isFetched;

  const tooltip = disabled ? tooltipMapping.true : tooltipMapping.false;

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
        icon=<AssetsIcon />
        toggled={enableContextualizedStyling}
        aria-label="asset-labels-button"
        onClick={onClick}
        disabled={disabled}
      />
    </CogsTooltip>
  );
};
