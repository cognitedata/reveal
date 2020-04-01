/*!
 * Copyright 2020 Cognite AS
 */

import { OperatorFunction } from 'rxjs';
import { ModelSectorData } from './ModelSectorData';

export interface RxModelSectorParser<D> {
  parseData(): OperatorFunction<ModelSectorData, D>;
}
