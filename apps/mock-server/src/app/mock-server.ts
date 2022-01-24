import * as jsonServer from 'json-server';

/**
 * Returns an Express server.
 */
export function createMockServer() {
  const server = jsonServer.create();

  // To handle POST, PUT and PATCH you need to use a body-parser
  // You can use the one used by JSON Server
  server.use(jsonServer.bodyParser);

  const middlewares = jsonServer.defaults({
    logger: true,
    noCors: true,
  });

  server.use([...middlewares]);

  // added this as default to prevent CORS issues
  // when using in combination with testcafe
  server.head('/', (req, res) => {
    res.status(200).jsonp(req.body);
  });

  server.get('/', (req, res) => {
    res.status(200).jsonp(req.body);
  });

  return server;
}
