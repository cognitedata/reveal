import { Cognite3DViewer } from "@cognite/reveal";
import { MeasurementTool } from "@cognite/reveal/tools";
import dat from "dat.gui";

export class MeasurementUi {
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurementTool: MeasurementTool;
  private _gui: dat.GUI;
  private _guiController: any[];

  private state = {
    lineWidth: 0.01,
    color: 0x00FFFF
  };

  private measurement = {
    enable: false
  }

  constructor(viewer: Cognite3DViewer, ui: dat.GUI) {
    this._viewer = viewer;
    this._measurementTool = new MeasurementTool(this._viewer, {changeMeasurementLabelMetrics: (distance: number) => {
      // 1 meters = 3.281 feet
      const distanceInFeet = distance * 3.281;
      return { distance: distanceInFeet, units: 'ft'};
     }, axisComponentMeasurement: true});
    this._gui = ui.addFolder('Types');
    this._guiController = [];
    const addDistanceOptions = this.addDistanceOptions.bind(this);

    this._gui.add(this.measurement, 'enable').name('Point To Point Distance').onChange(addDistanceOptions);
  }

  private addDistanceOptions(enable: boolean) {

    if (enable && this._guiController.length === 0) {
      //add the point to point measurement distance
      this._measurementTool.enterMeasurementMode();
      this.addGUI();
    } else if(!enable && this._guiController.length > 0) {
      this.removeGUI();
    }
  }

  private addGUI() {
    this._guiController.push(this._gui.add(this.state, 'lineWidth').name('Line Width').onFinishChange(linewidth => {
      this.state.lineWidth = linewidth;
      this.setMeasurementLineOptions();
    }));
    this._guiController.push(this._gui.addColor(this.state, 'color').name('Line Color').onFinishChange(color => {
      this.state.color = color;
      this.setMeasurementLineOptions();
    }));
  }

  private removeGUI() {
    this._guiController.forEach(guiController => {
      guiController.remove();
    });
    this._guiController.splice(0, this._guiController.length)
    this._measurementTool.exitMeasurementMode();
  }

  private setMeasurementLineOptions() {
    this._measurementTool.setLineOptions(this.state);
  }
}