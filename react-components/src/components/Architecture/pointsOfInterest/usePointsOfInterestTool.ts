import { PointsOfInterestTool } from '../../../architecture/concrete/pointsOfInterest/PointsOfInterestTool';
import { useRenderTarget } from '../../RevealCanvas';

export function usePointsOfInterestTool(): PointsOfInterestTool<unknown> | undefined {
  const renderTarget = useRenderTarget();
  return renderTarget.commandsController.getToolByType(PointsOfInterestTool);
}
