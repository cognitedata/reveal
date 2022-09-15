import { CognitePointCloudModel } from '@cognite/reveal';
import dat from 'dat.gui';

export class PointCloudClassificationFilterUI {
  constructor(ui: dat.GUI, model: CognitePointCloudModel) {
    const classes = model.getClasses();
    const visibility = classes.reduce((visibility, clazz) => {
      return {...visibility, [`${clazz}`]: model.isClassVisible(clazz.code) };
    }, {});

    classes.forEach(clazz => {
      ui.add(visibility, `${clazz}`).name(clazz.name).onChange((visible: boolean) => {
        model.setClassVisible(clazz.code, visible);
      });
    });
  }
}
