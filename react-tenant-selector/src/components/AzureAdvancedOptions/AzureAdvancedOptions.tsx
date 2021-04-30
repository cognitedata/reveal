import React from 'react';
import { Input, Collapse, Button } from '@cognite/cogs.js';
import { useTranslation } from '@cognite/react-i18n';

import { StyledAzureAdvancedOptions } from './elements';

export type AzureAdvancedOptions = {
  azureTenant?: string;
};

type Props = {
  advancedOptions: AzureAdvancedOptions;
  handleOnChange: (nextOptions: AzureAdvancedOptions) => void;
  handleSubmit: () => void;
};

const AdvancedAzureOptions = ({
  advancedOptions,
  handleOnChange,
  handleSubmit,
}: Props) => {
  const { t } = useTranslation('AzureAdvancedOptions');

  return (
    <StyledAzureAdvancedOptions>
      <Collapse accordion ghost>
        <Collapse.Panel
          header={t('panelHeader', { defaultValue: 'Advanced Azure options' })}
        >
          <Input
            title={t('inputTitle', { defaultValue: 'Azure tenant' })}
            defaultValue={advancedOptions.azureTenant}
            placeholder="Azure tenant"
            onChange={(e) => {
              handleOnChange({
                ...advancedOptions,
                azureTenant: e.target.value,
              });
            }}
          />
          <Button onClick={handleSubmit}>Set Azure tenant</Button>
        </Collapse.Panel>
      </Collapse>
    </StyledAzureAdvancedOptions>
  );
};

export default AdvancedAzureOptions;
