import dat from 'dat.gui';
import * as THREE from 'three';
import { Cognite3DViewer, DataSourceType } from '@cognite/reveal';
import { MeasurementTool } from '@cognite/reveal/tools';

export class MeasurementUi {
  private readonly _viewer: Cognite3DViewer<DataSourceType>;
  private readonly _measurementTool: MeasurementTool;
  private _gui: dat.GUI;
  private _guiController: dat.GUIController[];

  private state = {
    lineWidth: 0.01,
    color: 0xff8746,
    allMeasurement: false,
    showAllMeasurementLabels: true,
    showAllMeasurements: true
  };

  private measurement = {
    enable: false
  };

  constructor(viewer: Cognite3DViewer<DataSourceType>, ui: dat.GUI) {
    this._viewer = viewer;
    this._measurementTool = new MeasurementTool(this._viewer, {
      distanceToLabelCallback: (distanceInMeters: number) => {
        // 1 meters = 3.281 feet
        return `${(distanceInMeters * 3.281).toFixed(2)} ft`;
      }
    });
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
    } else if (!enable && this._guiController.length > 0) {
      this.removeGUI();
    }
  }

  private addGUI() {
    this._guiController.push(
      this._gui
        .add(this.state, 'lineWidth', 0.001, 10, 0.001)
        .name('Line width')
        .onFinishChange(lineWidth => {
          this.state.lineWidth = lineWidth;
          this.setMeasurementLineOptions();
        })
    );
    this._guiController.push(
      this._gui
        .addColor(this.state, 'color')
        .name('Line Color')
        .onFinishChange(color => {
          this.state.color = color;
          this.setMeasurementLineOptions();
        })
    );
    this._guiController.push(
      this._gui
        .add(this.state, 'showAllMeasurementLabels')
        .name('Show Measurement Labels')
        .onChange(showAllMeasurementLabels => {
          this.state.showAllMeasurementLabels = showAllMeasurementLabels;
          this._measurementTool.setMeasurementLabelsVisible(showAllMeasurementLabels);
        })
    );
    this._guiController.push(
      this._gui
        .add(this.state, 'showAllMeasurements')
        .name('Show Measurement')
        .onChange(showAllMeasurements => {
          this.state.showAllMeasurements = showAllMeasurements;
          this._measurementTool.visible(showAllMeasurements);
        })
    );
  }

  private removeGUI() {
    this._guiController.forEach(guiController => {
      guiController.remove();
    });
    this._guiController.splice(0, this._guiController.length);
    this.state.allMeasurement = false;
    this._measurementTool.exitMeasurementMode();
  }

  private setMeasurementLineOptions() {
    const options = {
      lineWidth: this.state.lineWidth,
      color: new THREE.Color(this.state.color),
      allMeasurement: this.state.allMeasurement,
      showAllMeasurementLabels: this.state.showAllMeasurementLabels,
      showAllMeasurments: this.state.showAllMeasurements
    };
    this._measurementTool.setLineOptions(options);
  }
}
