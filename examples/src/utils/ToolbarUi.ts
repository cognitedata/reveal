import { Cognite3DViewer } from "@cognite/reveal";
import { ToolbarTool, GeomapTool, MapConfig, MapboxMode, MapboxStyle, MapProviders, MapboxImageFormat } from '@cognite/reveal/tools';
import dat from 'dat.gui';

import geoMapIcon from '../pages/icons/Map.svg';

export class ToolbarUi {
  private readonly _viewer: Cognite3DViewer;
  private toolbar: ToolbarTool | undefined;
  private map: GeomapTool | undefined;

  private readonly _mapConfig: MapConfig = {
    provider: MapProviders.MapboxMap,
    APIKey: "pk.eyJ1IjoicHJhbW9kLXMiLCJhIjoiY2tzb2JkbXdyMGd5cjJubnBrM3IwMTd0OCJ9.jA9US2D2FRXUlldhE8bZgA",
    mode: MapboxMode.Style,
    id: MapboxStyle.Satellite_Streets,
    tileFormat: MapboxImageFormat.JPG70,
    latlong: {
      latitude: 59.9016426931744,
      longitude: 10.607235872426175
    }
  };

  constructor(viewer: Cognite3DViewer, ui: dat.GUI) {
    this._viewer = viewer;

    this.createToolbar(this._viewer);

    const guiState = {
      toolbarPosition: 'bottom'
    };

    const toolbarPosition = ['top', 'bottom', 'left', 'right'];
      ui.add(guiState, 'toolbarPosition', toolbarPosition).name('toolbarPosition').onFinishChange(value => {
        this.toolbar?.setPosition(value);
    });
  }

  private createToolbar(viewer: Cognite3DViewer) {
    this.toolbar = new ToolbarTool(viewer);

    this.toolbar.addAxisToolToggle();
    this.toolbar.addTakeScreenshotTool();
    this.toolbar.addCameraTargetOnClickToggle();
    this.toolbar.addZoomPastToCursorToggle();
    this.toolbar.addFitCameraToModel();

    this.toolbar.addToolbarToggleButton(geoMapIcon, this.geomapToggle, false, 'Maps');
  }

  private geomapToggle = () : void => {
    if(this.map === undefined) {
    this.map = new GeomapTool(this._viewer, this._mapConfig);
    }
    else {
      this.map.dispose();
      this.map = undefined;
    }
  }
}