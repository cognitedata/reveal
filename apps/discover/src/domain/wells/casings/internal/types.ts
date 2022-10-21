import { ConvertedDistance } from 'utils/units/constants';

import { CasingSchematic, CasingAssembly, Distance } from '@cognite/sdk-wells';

export interface CasingSchematicInternal
  extends Omit<CasingSchematic, 'casingAssemblies'> {
  casingAssemblies: Array<CasingAssemblyInternal>;
}

export interface CasingSchematicWithTvd
  extends Omit<CasingSchematic, 'casingAssemblies'> {
  casingAssemblies: Array<CasingAssemblyWithTvd>;
}

export interface CasingSchematicInternalWithTvd
  extends CasingSchematicInternal {
  casingAssemblies: Array<CasingAssemblyInternalWithTvd>;
}

export interface CasingAssemblyInternal
  extends Pick<CasingAssembly, 'type' | 'reportDescription'> {
  minInsideDiameter: ConvertedDistance;
  minOutsideDiameter: ConvertedDistance;
  maxOutsideDiameter: ConvertedDistance;
  measuredDepthTop: ConvertedDistance;
  measuredDepthBase: ConvertedDistance;
  outsideDiameterFormatted: string;
  insideDiameterFormatted: string;
  isLiner: boolean;
}

export interface CasingAssemblyWithTvd extends CasingAssembly {
  trueVerticalDepthTop?: Distance;
  trueVerticalDepthBase?: Distance;
}

export interface CasingAssemblyInternalWithTvd extends CasingAssemblyInternal {
  trueVerticalDepthTop?: ConvertedDistance;
  trueVerticalDepthBase?: ConvertedDistance;
}
