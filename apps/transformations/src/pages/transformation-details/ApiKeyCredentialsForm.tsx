import { useTranslation } from '@transformations/common';
import { Input } from 'antd';

import {
  StyledFormContainer,
  StyledFormGroup,
  StyledFormItemLabel,
} from './FormShared';

type ApiKeyCredentialsFormProps = {
  setApiKey: (secret: string) => void;
  apiKey?: string;
};

const ApiKeyCredentialsForm = ({
  apiKey,
  setApiKey,
}: ApiKeyCredentialsFormProps) => {
  const { t } = useTranslation();

  return (
    <StyledFormContainer>
      <div>
        <StyledFormGroup>
          <StyledFormItemLabel
            label={t('api-key')}
            htmlFor="api-key"
            required
          />
          <Input
            id="api-key"
            placeholder={t('enter-api-key')}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
          />
        </StyledFormGroup>
      </div>
    </StyledFormContainer>
  );
};

export default ApiKeyCredentialsForm;
