import { CognitePointCloudModel, WellKnownAsprsPointClassCodes } from '@cognite/reveal';
import dat from 'dat.gui';

export class PointCloudClassificationFilterUI {
  constructor(ui: dat.GUI, model: CognitePointCloudModel) {
    const classes = model.getClasses();
    const visibility = classes.reduce((visibility, clazz) => {
      return {...visibility, [`${clazz}`]: model.isClassVisible(clazz) };
    }, {});

    classes.forEach(clazz => {
      ui.add(visibility, `${clazz}`).name(getClassName(clazz)).onChange((visible: boolean) => {
        model.setClassVisible(clazz, visible);
      });
    });
  }
}

function getClassName(clazz: number | string): string {
  if (typeof(clazz) === 'string') {
    return clazz;
  }

  const entry = Object.entries(WellKnownAsprsPointClassCodes)
    .find(entry => entry[1] == clazz);
  return (entry !== undefined) ? entry[0] : `Class ${clazz}`;
}
