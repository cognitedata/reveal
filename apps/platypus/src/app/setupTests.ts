// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';
import { configureI18n } from '@cognite/react-i18n';
import config from '@platypus-app/config/config';
import { CogniteClient } from '@cognite/sdk';
import { setCogniteSDKClient } from '../environments/cogniteSdk';

configureI18n();

const cogniteClient: CogniteClient = new CogniteClient({
  appId: config.APP_APP_ID,
});
cogniteClient.setBaseUrl(window.location.origin);
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
cogniteClient.initAPIs();

setCogniteSDKClient(cogniteClient!);
