import { useContext } from 'react';
import ScalerContext, { Scaler } from '../context/Scaler';

export function useScalerContext(): Scaler {
  return useContext(ScalerContext);
}
