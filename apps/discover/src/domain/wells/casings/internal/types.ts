import { ConvertedDistance, LinearWeight } from 'utils/units/constants';

import {
  CasingSchematic,
  CasingAssembly,
  Distance,
  CasingComponent,
} from '@cognite/sdk-wells';

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
  id: string;
  minInsideDiameter: ConvertedDistance;
  minOutsideDiameter: ConvertedDistance;
  maxOutsideDiameter: ConvertedDistance;
  measuredDepthTop: ConvertedDistance;
  measuredDepthBase: ConvertedDistance;
  outsideDiameterFormatted: string;
  insideDiameterFormatted: string;
  isLiner: boolean;
  components?: Array<CasingComponentInternal>;
}

export interface CasingAssemblyWithTvd extends CasingAssembly {
  trueVerticalDepthTop?: Distance;
  trueVerticalDepthBase?: Distance;
}

export interface CasingAssemblyInternalWithTvd extends CasingAssemblyInternal {
  trueVerticalDepthTop?: ConvertedDistance;
  trueVerticalDepthBase?: ConvertedDistance;
}

export interface CasingComponentInternal
  extends Omit<
    CasingComponent,
    | 'minInsideDiameter'
    | 'maxOutsideDiameter'
    | 'topMeasuredDepth'
    | 'baseMeasuredDepth'
    | 'linearWeight'
  > {
  minInsideDiameter?: ConvertedDistance;
  maxOutsideDiameter?: ConvertedDistance;
  topMeasuredDepth?: ConvertedDistance;
  baseMeasuredDepth?: ConvertedDistance;
  linearWeight?: LinearWeight;
}
