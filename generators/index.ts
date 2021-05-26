import { NodePlopAPI } from 'plop';

import generator from './generator';

module.exports = (plop: NodePlopAPI) => {
  plop.setGenerator('Generator', generator);
  plop.addHelper('curly', (_: unknown, open: boolean) => (open ? '{' : '}'));
};
