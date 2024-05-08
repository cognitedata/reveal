import { CognitePointCloudModel } from '@cognite/reveal';
import dat from 'dat.gui';

export class PointCloudClassificationFilterUI {
  constructor(ui: dat.GUI, model: CognitePointCloudModel) {
    const classes = model.getClasses();
    const visibility = classes.reduce((visibility, pointClass) => {
      return { ...visibility, [`${pointClass}`]: model.isClassVisible(pointClass.code) };
    }, {});

    classes.forEach(pointClass => {
      ui.add(visibility as any, `${pointClass}`)
        .name(pointClass.name)
        .onChange((visible: boolean) => {
          model.setClassVisible(pointClass.code, visible);
        });
    });
  }
}
