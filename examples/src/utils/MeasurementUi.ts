import { Cognite3DViewer } from "@cognite/reveal";
import { MeasurementTool } from "@cognite/reveal/tools";
import dat from "dat.gui";

export class MeasurementUi {
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurementTool: MeasurementTool;
  private _gui: dat.GUI;
  private _guiController: any[];

  private state = {
    linewidth: 0.002,
    color: '#00FFFF'
  };

  private pointToPointMeasurement = {
    pointDistance: false
  }

  constructor(viewer: Cognite3DViewer, ui: dat.GUI) {
    this._viewer = viewer;
    this._measurementTool = new MeasurementTool(this._viewer, {changeMeasurementLabelMetrics: (distance: number) => {
      // 1 meters = 3.281 feet
      const distanceInFeet = distance * 3.281;
      return { distance: distanceInFeet, units: 'ft'};
     }});
    this._gui = ui.addFolder('Types');
    this._guiController = [];
    const addDistanceOptions = this.addDistanceOptions.bind(this);

    this._gui.add(this.pointToPointMeasurement, 'pointDistance').name('Point To Point Distance').onChange(addDistanceOptions);
  }

  addDistanceOptions(enable: boolean) {

    if (enable && this._guiController.length === 0) {
      //add the point to point measurement distance
      this._measurementTool.add();

      this._guiController.push(this._gui.add(this.state, 'linewidth').name('Line Width').onFinishChange(linewidth => {
        this._measurementTool.updateLineWidth(linewidth);
        this.state.linewidth = linewidth;
      }));
      this._guiController.push(this._gui.addColor(this.state, 'color').name('Line Color').onFinishChange(color => {
        this._measurementTool.updateLineColor(color);
        this.state.color = color;
      }));
    } else if(!enable && this._guiController.length > 0) {
      this._guiController.forEach(guiController => {
        guiController.remove();
      });
      this._guiController.splice(0, this._guiController.length)
      this._measurementTool.remove();
    }
  }
}