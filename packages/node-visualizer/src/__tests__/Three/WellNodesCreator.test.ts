import { data } from '__tests__/Three/test-data';
import { BPData } from 'Solutions/BP/BPData';
import { WellTrajectoryNode } from '../../SubSurface/Wells/Nodes/WellTrajectoryNode';
import { WellTrajectoryView } from 'ThreeSubSurface/Wells/WellTrajectoryView';
import { ViewInfo } from 'Core/Views/ViewInfo';
import { Vector3 } from 'Core/Geometry/Vector3';
import { Object3D } from 'three';
import { ThreeRenderTargetNode } from 'Three/Nodes/ThreeRenderTargetNode';
import { WellNodesCreator } from 'Solutions/BP/Creators/WellNodesCreator';

const DataFaker = {
  intersection: {
    distance: 0,
    point: new Vector3(1, 0, 0),
    object: new Object3D(),
  } as any,
};

describe('WellNodesCreator should work as designed', () => {
  test('BPData initializes wells succesfully', async () => {
    const testData = new BPData(data as any);
    // should only have "1 Well which is Well OPH23672416"
    expect(testData.wellMap.size).toBe(1);
  });

  test('WellNodesCreator creates wells and trajectories', async () => {
    const testData = new BPData(data as any);
    const wellNodes = WellNodesCreator.create(testData);
    expect(wellNodes?.length).toBe(1);
    expect(wellNodes?.[0].name).toBe('Well OPH23672416');
    // should have one trajectory
    expect(wellNodes?.[0].children.length).toBe(1);
  });

  test('WellNodesCreator testing if the ViewInfo box on the trajectory displays correct units', async () => {
    const testData = new BPData(data as any);
    const wellNodes = WellNodesCreator.create(testData);

    /**
     * Pick a well node, (we only have one) and select its trajectory
     */
    const wellNode = wellNodes?.[0];
    const trajectoryNode = wellNode?.children[0] as WellTrajectoryNode;
    /**
     * We need to add a dummy node as a child to the original
     * node because of a check for children in the view code
     */
    const fakeTrajectoryNode = new WellTrajectoryNode();
    trajectoryNode.addChild(fakeTrajectoryNode);
    fakeTrajectoryNode.trajectory = trajectoryNode.trajectory;

    /**
     * Create a view
     */
    const view = new WellTrajectoryView();
    const rendertarget = new ThreeRenderTargetNode(undefined);

    /**
     * Attach the node to the view
     */
    view.attach(trajectoryNode, rendertarget);
    const viewInfo = new ViewInfo();

    /**
     * Get the last sample from the test data
     */
    const trajectorySamples = fakeTrajectoryNode.trajectory?.samples;
    const sampleData =
      trajectorySamples && trajectorySamples[trajectorySamples.length - 1];

    viewInfo.addValue = jest.fn();

    WellTrajectoryView.startPickingAndReturnMd(
      view,
      viewInfo,
      DataFaker.intersection,
      sampleData?.md,
      undefined,
      'ft'
    );
    expect(viewInfo.addValue).toHaveBeenNthCalledWith(
      1,
      'Well',
      'Well OPH23672416'
    );
    expect(viewInfo.addValue).toHaveBeenNthCalledWith(
      2,
      'Trajectory',
      'OPH2367241601'
    );
    expect(viewInfo.addValue).toHaveBeenNthCalledWith(
      3,
      'Md',
      '3839.83 ft / 1170.38 m'
    );

    WellTrajectoryView.startPickingAndReturnMd(
      view,
      viewInfo,
      DataFaker.intersection,
      sampleData?.md,
      undefined,
      undefined
    );
    expect(viewInfo.addValue).toHaveBeenNthCalledWith(
      3,
      'Md',
      '3839.83 ft / 1170.38 m'
    );
  });
});
