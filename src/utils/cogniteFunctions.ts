import sdk from 'services/CogniteSDK';

export const waitOnFunctionComplete = (
  tenant: string,
  funcId: number,
  callId: number
): Promise<string> => {
  const startTime = Date.now();
  return new Promise((resolve) => {
    sdk
      .get<{ status: string }>(
        `https://api.cognitedata.com/api/playground/projects/${tenant}/functions/${funcId}/calls/${callId}`
      )
      .then((result) => {
        if (result.data.status === 'Running') {
          if (Date.now() - startTime >= 1000 * 60 * 2) {
            // If it takes longer than 60 seconds, time out.
            resolve('Timeout');
          }
          // Wait 1 second before checking the status again
          new Promise((resolveWaiter) => setTimeout(resolveWaiter, 1000)).then(
            () => {
              waitOnFunctionComplete(tenant, funcId, callId).then(resolve);
            }
          );
        } else if (result.data.status === 'Failed') {
          resolve('Failed');
        } else {
          resolve('Success');
        }
      });
  });
};
