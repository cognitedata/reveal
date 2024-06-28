/*!
 * Copyright 2024 Cognite AS
 */
export type TranslateDelegate = (key: string, fallback?: string) => string;

export type TranslateKey = {
  key?: string;
  fallback: string;
};
