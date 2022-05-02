import React, { useEffect, useState } from 'react';

import { useLanguage } from '../..';

type I18nWrapperProps = {
  children: React.ReactNode;
  errorScreen?: (e: Error) => React.ReactElement | null;
  loadingScreen?: React.ReactElement | null;
  onLanguageChange: (language: string) => Promise<any>;
};

const I18nWrapper = ({
  children,
  errorScreen,
  loadingScreen,
  onLanguageChange,
}: I18nWrapperProps): JSX.Element => {
  const [didLoadTranslations, setDidLoadTranslations] = useState(false);
  const [error, setError] = useState<Error | undefined>();

  const { data: language, isClientReady } = useLanguage();

  useEffect(() => {
    if (isClientReady) {
      onLanguageChange(language)
        .then(() => {
          setDidLoadTranslations(true);
        })
        .catch((e) => {
          setError(e);
        });
    }
  }, [isClientReady, language, onLanguageChange]);

  if (error && errorScreen) {
    return errorScreen(error);
  }

  if (!didLoadTranslations && !error) {
    return loadingScreen;
  }

  return <>{children}</>;
};

export default I18nWrapper;
