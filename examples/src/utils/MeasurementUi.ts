import { Cognite3DViewer } from "@cognite/reveal";
import { MeasurementLineOptions } from "@cognite/reveal/tools";
import { MeasurementTool, MeasurementUnits } from "@cognite/reveal/tools";
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

  private types = {
    pointDistance: false
  }

  constructor(viewer: Cognite3DViewer, ui: dat.GUI) {
    this._viewer = viewer;
    this._measurementTool = new MeasurementTool(this._viewer, {unitsUpdateCallback: () => { return MeasurementUnits.Meter}});
    this._gui = ui.addFolder('Types');
    this._guiController = [];
    const addDistanceOptions = this.addDistanceOptions.bind(this);

    this._gui.add(this.types, 'pointDistance').name('Point To Point Distance').onChange(addDistanceOptions);
  }

  addDistanceOptions(enable: boolean) {

    if (enable && this._guiController.length === 0) {
      //add the point to point measurement distance
      this._measurementTool.add();
      this._guiController.push(this._gui.add(this.state, 'linewidth').name('Line Width').onFinishChange(linewidth => {
        const options: MeasurementLineOptions = {
          lineWidth: linewidth
        }
        this._measurementTool.updateLineOptions(options);
        this.state.linewidth = linewidth;
      }));
      this._guiController.push(this._gui.addColor(this.state, 'color').name('Line Color').onFinishChange(color => {
        const options: MeasurementLineOptions = {
          color: color
        }
        this._measurementTool.updateLineOptions(options);
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

  getController(name: string): dat.GUIController | null {
    let controller = null;
    const controllers = this._gui.__controllers;
    for (let i = 0; i < controllers.length; i++) {
      let c = controllers[i];
      if (c.property === name) {
        controller = c;
        break;
      }
    }
    return controller;
  }
}