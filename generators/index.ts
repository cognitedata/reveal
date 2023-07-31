import { NodePlopAPI } from 'plop';

import generator from './generator';
import {
  addLibrary,
  copyMany,
  disableExperimental,
  disableIntercom,
} from './actions';

module.exports = (plop: NodePlopAPI) => {
  plop.setGenerator('Generator', generator);
  plop.addHelper('curly', (_: unknown, open: boolean) => (open ? '{' : '}'));

  plop.setActionType('addLibrary', addLibrary);
  plop.setActionType('copyMany', copyMany);
  plop.setActionType('disableIntercom', disableIntercom);
  plop.setActionType('disableExperimental', disableExperimental);
};
