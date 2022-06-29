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
  private _selectedObject: THREE.Group | null;
  private _storedMaterial: LineMaterial;

  private state = {
    lineWidth: 2.0,
    color: 0x00FFFF,
    allMeasurement: false,
    showAllMeasurementLabels: true
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
     }});
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
    this._guiController.push(this._gui.add(this.state, 'lineWidth', 0.001, 25, 0.001).name('Line Width').onFinishChange(linewidth => {
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
    this._guiController.push(this._gui.add(this.state, 'showAllMeasurementLabels').name('Show Measurement Labels').onChange(showAllMeasurementLabels => {
      this.state.showAllMeasurementLabels = showAllMeasurementLabels;
      this._measurementTool.showMeasurementLabels(showAllMeasurementLabels);
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
    this._measurementTool.setLineOptions(this.state, this._selectedObject as THREE.Group);
    if (this._selectedObject?.children.length! > 1) {
      //Reset back the opacity back to normal after change
      (this._selectedObject?.children[0] as Line2).material.opacity = 1.0;
      this._storedMaterial.copy((this._selectedObject?.children[0] as Line2).material as THREE.Material);
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
      select: (meshGroup: THREE.Group) => {
        this.reset();
        this._selectedObject = meshGroup;
        this._selectedObject.children.forEach(lineMesh => {
          const material = (lineMesh as Line2).material as LineMaterial;
          this._storedMaterial.copy(material);
          material.opacity = 0.15;
        });
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
    if (measurementsObjects!.length > 0) {

      measurementsObjects!.forEach((meshGroup: any) => {
        count++;
        this._measurementObjectControllerUi.push(this._gui.add({select: objects.select.bind(this, meshGroup)}, 'select').name('mesh' + count.toString()));
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
    if (this._selectedObject?.children?.length! > 1) {
      this._selectedObject?.children.forEach(mesh => {
        (mesh as Line2).material.opacity = 1.0;
      });
      this._selectedObject?.clear();

      this._viewer.requestRedraw();
    }
  }
}