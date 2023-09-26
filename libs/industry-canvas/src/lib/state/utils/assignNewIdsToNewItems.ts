import { IndustryCanvasState } from '../../types';

export const mapOldIdsToNewIds = <T>(
  data: Record<string, T>,
  newIdByOldId: Map<string, string>
): Record<string, T> =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => {
      const [oldId, newId] =
        Array.from(newIdByOldId.entries()).find(([oldId]) =>
          key.startsWith(oldId)
        ) ?? [];
      if (newId === undefined || oldId === undefined) {
        return [key, value];
      }
      return [key.replace(oldId, newId), value];
    })
  );

const assignNewIdsToNewItems = (
  {
    nodes,
    filters,
    pinnedTimeseriesIdsByAnnotationId,
    liveSensorRulesByAnnotationIdByTimeseriesId,
  }: IndustryCanvasState,
  newIdByOldId: Map<string, string>
): IndustryCanvasState => ({
  nodes: nodes.map((node) => {
    const newId = newIdByOldId.get(node.id);
    if (newId === undefined) {
      return node;
    }
    return { ...node, id: newId };
  }),
  filters: filters.map((filter) => {
    const containerId = filter.containerId;
    if (containerId === undefined) {
      return filter;
    }
    const newContainerId = newIdByOldId.get(containerId);
    if (newContainerId === undefined) {
      return filter;
    }
    return { ...filter, containerId: newContainerId };
  }),
  pinnedTimeseriesIdsByAnnotationId: mapOldIdsToNewIds(
    pinnedTimeseriesIdsByAnnotationId,
    newIdByOldId
  ),
  liveSensorRulesByAnnotationIdByTimeseriesId: mapOldIdsToNewIds(
    liveSensorRulesByAnnotationIdByTimeseriesId,
    newIdByOldId
  ),
});

export default assignNewIdsToNewItems;
