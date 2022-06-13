import {
  CasingAssemblyInternal,
  CasingSchematicInternal,
} from 'domain/wells/casings/internal/types';

import { ConvertedDistance } from 'utils/units/constants';

export interface CasingsView extends CasingSchematicInternal {
  wellName: string;
  wellboreName: string;
  casingAssemblies: Array<CasingAssemblyView>;
  rkbLevel: ConvertedDistance;
  waterDepth: ConvertedDistance;
}

export interface CasingAssemblyView extends CasingAssemblyInternal {
  trueVerticalDepthTop?: ConvertedDistance;
  trueVerticalDepthBase?: ConvertedDistance;
}
