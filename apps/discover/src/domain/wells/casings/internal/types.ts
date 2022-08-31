import { ConvertedDistance } from 'utils/units/constants';

import { CasingSchematic, CasingAssembly } from '@cognite/sdk-wells';

export interface CasingSchematicInternal
  extends Omit<CasingSchematic, 'casingAssemblies'> {
  casingAssemblies: Array<CasingAssemblyInternal>;
}

export interface CasingAssemblyInternal
  extends Pick<CasingAssembly, 'type' | 'reportDescription'> {
  minInsideDiameter: ConvertedDistance;
  minOutsideDiameter: ConvertedDistance;
  maxOutsideDiameter: ConvertedDistance;
  measuredDepthTop: ConvertedDistance;
  measuredDepthBase: ConvertedDistance;
}

export interface CasingSchematicInternalWithTvd
  extends CasingSchematicInternal {
  casingAssemblies: Array<CasingAssemblyInternalWithTvd>;
}

export interface CasingAssemblyInternalWithTvd extends CasingAssemblyInternal {
  trueVerticalDepthTop?: ConvertedDistance;
  trueVerticalDepthBase?: ConvertedDistance;
}
