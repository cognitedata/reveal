import React from 'react';
import { Input, Collapse } from '@cognite/cogs.js';
import { useTranslation } from '@cognite/react-i18n';

import { StyledAzureAdvancedOptions } from './elements';

export type AzureAdvancedOptions = {
  azureTenant?: string;
};

type Props = {
  advancedOptions: AzureAdvancedOptions;
  handleOnChange: (nextOptions: AzureAdvancedOptions) => void;
};

const AdvancedAzureOptions = ({ advancedOptions, handleOnChange }: Props) => {
  const { t } = useTranslation('AzureAdvancedOptions');

  const handleUpdateInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleOnChange({
      ...advancedOptions,
      azureTenant: event.target.value,
    });
  };

  return (
    <StyledAzureAdvancedOptions>
      <Collapse accordion ghost>
        <Collapse.Panel
          header={t('panelHeader', { defaultValue: 'Advanced Azure options' })}
        >
          <Input
            title={t('inputTitle', {
              defaultValue: 'Azure tenant',
            })}
            defaultValue={advancedOptions.azureTenant}
            placeholder="ID or name, Eg: myproject.onmicrosoft.com"
            onChange={handleUpdateInput}
          />
        </Collapse.Panel>
      </Collapse>
    </StyledAzureAdvancedOptions>
  );
};

export default AdvancedAzureOptions;
