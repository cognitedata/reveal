import { Button, Flex } from '@cognite/cogs.js';
import { makeDefaultTranslations } from 'utils/translations';

type Props = {
  title: string;
  text?: string;
  translations?: typeof defaultTranslations;
};

const defaultTranslations = makeDefaultTranslations('Reload Page');

const ErrorToast = ({ title, text, translations }: Props) => {
  const t = { ...defaultTranslations, ...translations };
  return (
    <div>
      <h3>{title}</h3>
      <div style={{ paddingBottom: 8 }}>{text}</div>
      <Flex>
        <Button
          type="primary"
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
          {t['Reload Page']}
        </Button>
      </Flex>
    </div>
  );
};

ErrorToast.translationKeys = Object.keys(defaultTranslations);

export default ErrorToast;
