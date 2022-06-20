import { Cognite3DViewer } from "@cognite/reveal";
import { MeasurementTool } from "@cognite/reveal/tools";
import * as THREE from 'three';
import dat from "dat.gui";
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

export class MeasurementUi {
  private readonly _viewer: Cognite3DViewer;
  private readonly _measurementTool: MeasurementTool;
  private _gui: dat.GUI;
  private _guiController: any[];
  private _measurementObjectControllerUi: any[];
  private _selectedObject: Line2 | null;
  private _storedMaterial: LineMaterial;

  private state = {
    lineWidth: 2.0,
    color: 0x00FFFF,
    allMeasurement: false,
    axisComponents: false
  };

  private measurement = {
    enable: false
  }

  constructor(viewer: Cognite3DViewer, ui: dat.GUI) {
    this._viewer = viewer;
    this._selectedObject = null;
    this._storedMaterial = new LineMaterial();
    this._measurementTool = new MeasurementTool(this._viewer, {changeMeasurementLabelMetrics: (distance: number) => {
      // 1 meters = 3.281 feet
      const distanceInFeet = distance * 3.281;
      return { distance: distanceInFeet, units: 'ft'};
     }, axisComponents: false});
    this._gui = ui.addFolder('Types');
    this._guiController = [];
    this._measurementObjectControllerUi = [];
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
    this._guiController.push(this._gui.add(this.state, 'lineWidth', 2, 25, 1).name('Line Width').onFinishChange(linewidth => {
      this.state.lineWidth = linewidth;
      this.setMeasurementLineOptions();
    }));
    this._guiController.push(this._gui.addColor(this.state, 'color').name('Line Color').onFinishChange(color => {
      this.state.color = color;
      this.setMeasurementLineOptions();
    }));
    this._guiController.push(this._gui.add(this.state, 'allMeasurement').name('Show all Measurement').onChange(allMeasurement => {
      this.state.allMeasurement = allMeasurement;
      this.measurementObjectsUI(allMeasurement);
    }));
    this._guiController.push(this._gui.add(this.state, 'axisComponents').name('Show axes component').onChange(axisComponents => {
      this.state.axisComponents = axisComponents;
      this._measurementTool.enableAxesComponent(this.state, this._selectedObject!);
    }));
  }

  private removeGUI() {
    this._guiController.forEach(guiController => {
      guiController.remove();
    });
    this._guiController.splice(0, this._guiController.length);
    this.state.allMeasurement = false;
    this.removeMeasurementObjectUI();
    this._measurementTool.exitMeasurementMode();
  }

  private setMeasurementLineOptions() {
    // @ts-ignore: Object is possibly 'null'.
    this._measurementTool.setLineOptions(this.state, this._selectedObject as THREE.Mesh);
    if (this._selectedObject) {
      this._storedMaterial.copy(this._selectedObject.material as THREE.Material);
    }
  }

  private measurementObjectsUI(enable: boolean) {
    if (enable && this._measurementObjectControllerUi.length === 0) {
      this.populateMeasurementObjectUI();
    } else {
      this.removeMeasurementObjectUI();
    }
  }

  private populateMeasurementObjectUI() {
    if (this._measurementObjectControllerUi.length > 0) {
      this.removeMeasurementObjectUI();
    }
    const objects = {
      select: (mesh: Line2) => {
        this.reset();
        this._selectedObject = mesh;
        const material = mesh.material as LineMaterial;
        this._storedMaterial.copy(material);
        material.color.set(new THREE.Color('white'));
        this._viewer.requestRedraw();
      },
      delete: () => {
        this._measurementTool.removeMeasurement(this._selectedObject!);
        this.reset();
        this.populateMeasurementObjectUI();
      },
      deleteAll: () => {
        this._measurementTool.removeAllMeasurement();
        this.reset();
        this.removeMeasurementObjectUI();
      }
    };
    let count = 0;
    const measurementsObjects = this._measurementTool.getAllMeasurement();
    if (measurementsObjects.length > 0) {

      measurementsObjects.forEach((mesh: any) => {
        count++;
        this._measurementObjectControllerUi.push(this._gui.add({select: objects.select.bind(this, mesh)}, 'select').name('mesh' + count.toString()));
      });
      this._measurementObjectControllerUi.push(this._gui.add(objects, 'delete').name('Remove selected measurement'));
      this._measurementObjectControllerUi.push(this._gui.add(objects, 'deleteAll').name('Remove All measurement'));
    }
  }

  private removeMeasurementObjectUI() {
    this._measurementObjectControllerUi.forEach(controller => {
      controller.remove();
    });
    this._measurementObjectControllerUi.splice(0, this._measurementObjectControllerUi.length);
  }

  reset() {
    if (this._selectedObject) {
      this._selectedObject.material.color.set(this._storedMaterial.color);
      this._selectedObject = new Line2();
      this._viewer.requestRedraw();
    }
  }
}