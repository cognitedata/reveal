import { base64Encode } from '../../utils';

/**
 * Transforms the response that it comming from JSON Server
 * It wraps the response into items and apply pagination
 * by adding Cursor.
 */
export function transformGetRequest(req, res) {
  const originalSend = res.jsonp;
  res.jsonp = (...args) => {
    const total = res.getHeader('X-Total-Count');
    const limit = +req.body.limit || 100;
    const start = +req.query._start || 0;
    let nextCursor = null;

    if (total && +total > limit && start + limit < total) {
      nextCursor = base64Encode(`${start + limit}_${total}`);
    }

    const response = {
      items: args[0],
      nextCursor: nextCursor,
    };
    return originalSend.call(res, response);
  };
}

/**
 * Transforms the response that is coming from JSON Server
 * It wraps the response into items
 */
export function transformPostPutRequest(req, res) {
  const originalSend = res.jsonp;
  res.jsonp = (...args) => {
    let response = {
      items: args[0],
    };
    if (req.url.includes('/transformations')) {
      response = {
        items: [args[0]],
      };
    }

    return originalSend.call(res, response);
  };
}
