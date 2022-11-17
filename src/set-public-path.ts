import { setPublicPath } from 'systemjs-webpack-interop';
import config from 'config/config';

/* This dynamically sets the webpack public path so that code splits work properly. See related:
 * https://github.com/joeldenning/systemjs-webpack-interop#what-is-this
 * https://webpack.js.org/guides/public-path/#on-the-fly
 * https://single-spa.js.org/docs/faq/#code-splits
 */

if (config.isFusion) setPublicPath('@cognite/cdf-charts-ui');
