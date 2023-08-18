// Notes from CogniteIdP team =>
// https://cognitedata.slack.com/archives/C05EU17EEQK/p1691754244679599?thread_ts=1691750958.992589&cid=C05EU17EEQK

import { getFlow } from '@cognite/cdf-sdk-singleton';
import { IDPType } from '@cognite/login-utils';

export const isCogniteIdPUsedToSignIn = () => {
  const { flow } = getFlow();
  return flow === ('COGNITE_IDP' as IDPType);
};
