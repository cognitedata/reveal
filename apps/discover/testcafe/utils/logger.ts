import { RequestLogger } from 'testcafe';

export const getPostLogger = (url?: string) => getNetworkLogger(url);
export const getGetLogger = (url?: string) => getNetworkLogger(url);

export const getNetworkLogger = (
  url = '',
  options = {
    logRequestBody: true,
    logRequestHeaders: true,
    stringifyRequestBody: true,

    stringifyResponseBody: true,
    logResponseHeaders: true,
    logResponseBody: true,
  }
) => {
  // https://testcafe.io/documentation/402769/reference/test-api/requestlogger/constructor
  const logger = RequestLogger(url, options);

  return logger;
};

export const logNetworkLoggerResults = (
  logger: RequestLogger,
  matchList: string[] = []
) => {
  // eslint-disable-next-line
  console.log('Total requests:', logger.requests.length);

  // eslint-disable-next-line
  // console.log('All requests', logger.requests);

  const ignoreList = [
    'https://fonts.googleapis.com',
    'https://api.locize.app',
    'https://storage.googleapis.com',
    'https://dc.services.visualstudio.com',
    'https://cdn.cogniteapp.com',
    'https://events.mapbox.com',
    'https://api.mapbox.com/',
    'https://api-js.mixpanel.com',
    'http://127.0.0.1:',
    'http://localhost:',
  ];

  const isInList = (url: string, list: string[]) => {
    return list.find((ignoreUrl) => url.includes(ignoreUrl));
  };

  const log = (request: LoggedRequest) => {
    // eslint-disable-next-line
    console.error(
      '\r\n--------------------- REQUEST ERROR --------------------\r\n',
      JSON.stringify(request, null, 4),
      '\r\n----------------- END OF REQUEST ERROR -----------------\r\n'
    );
  };

  logger.requests.forEach((request) => {
    if (!isInList(request.request.url, ignoreList)) {
      if (matchList.length > 0) {
        if (isInList(request.request.url, matchList)) {
          log(request);
        }
      } else {
        log(request);
      }
    }
  });
};
