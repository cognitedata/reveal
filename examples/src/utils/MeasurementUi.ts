import { Cognite3DViewer } from "@cognite/reveal";
import { MeasurementLineOptions } from "@cognite/reveal/tools";
import { MeasurementTool } from "@cognite/reveal/tools";

export class MeasurementUi {
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurementTool: MeasurementTool;

  constructor(viewer: Cognite3DViewer, ui: dat.GUI) {
    this._viewer = viewer;
    this._measurementTool = new MeasurementTool(this._viewer);
    this._measurementTool.addMeasurementDistance();

    const state = {
      linewidth: 0.02,
      color: '#00FFFF'
    };

    const gui = ui.addFolder('Line Options');
    gui.add(state, 'linewidth').name('Line Width').onFinishChange(linewidth => {
      const options: MeasurementLineOptions = {
        lineWidth: linewidth
      }
      this._measurementTool.setLineOptions(options);
    });
    gui.addColor(state, 'color').name('Line Color').onFinishChange(color => {
      const options: MeasurementLineOptions = {
        color: color
      }
      this._measurementTool.setLineOptions(options);
    });
  }
}