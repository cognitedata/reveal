/*
 * Copyright 2021 Cognite AS
 */

import { createOverlay } from './TestFunctionsSigrid';
import * as THREE from 'three';
import { Cognite3DViewer, CognitePointCloudModel, Image360 } from "@cognite/reveal";
import { HtmlOverlayTool } from '@cognite/reveal/tools';
import * as dat from 'dat.gui';
import { CogniteClient, Metadata, AnnotationCreate, AnnotationFilter } from '@cognite/sdk';
import { Box2 } from 'three';


export class Image360UI {

  constructor(viewer: Cognite3DViewer, gui: dat.GUI, client: CogniteClient) {

    let entities: Image360[] = [];

    const optionsFolder = gui.addFolder('Add Options');

    const translation = {
      x: 0,
      y: 0,
      z: 0
    };

    const rotation = {
      x: 0,
      y: 0,
      z: 0,
      radians: 0
    };

    const opacity = {
      alpha: 1
    };

    const params = {
      siteId: '',
      add: add360ImageSet,
      premultipliedRotation: true,
      remove: removeAll360Images
    };

    optionsFolder.add(params, 'siteId').name('Site ID');

    const translationGui = optionsFolder.addFolder('Translation');
    translationGui.add(translation, 'x').name('Translation X');
    translationGui.add(translation, 'y').name('Translation Y');
    translationGui.add(translation, 'z').name('Translation Z');

    const rotationGui = optionsFolder.addFolder('Rotation');
    rotationGui.add(rotation, 'x').name('Rotation Axis X');
    rotationGui.add(rotation, 'y').name('Rotation Axis Y');
    rotationGui.add(rotation, 'z').name('Rotation Axis Z');
    rotationGui.add(rotation, 'radians', 0, 2 * Math.PI, 0.001);

    optionsFolder.add(params, 'premultipliedRotation').name('Pre-multiplied rotation');

    gui.add(params, 'add').name('Add image set');

    gui.add(opacity, 'alpha', 0, 1, 0.01).onChange(() => {
      entities.forEach(p => (p.image360Visualization.opacity = opacity.alpha));
      viewer.requestRedraw();
    });

    gui.add(params, 'remove').name('Remove all 360 images');

    async function add360ImageSet() {

      const overlayTool = new HtmlOverlayTool(viewer);

      // Rotation and translation matrices, not defined by me
      const rotationMatrix = new THREE.Matrix4().makeRotationAxis(new THREE.Vector3(rotation.x, rotation.y, rotation.z), rotation.radians);
      const translationMatrix = new THREE.Matrix4().makeTranslation(translation.x, translation.y, translation.z);
      const collectionTransform = translationMatrix.multiply(rotationMatrix);
      const set = await viewer.add360ImageSet('events', { site_id: params.siteId }, { collectionTransform, preMultipliedRotation: params.premultipliedRotation });

      // **** TEST CODE SIGRID BELOW **** //
      // Point cloud model 
      const pointCloudModel = viewer.models[0] as CognitePointCloudModel;

      // add 3D annotation - e.g bounding volume
      // -12.75, -0.6588, 8.2902
      const cdfToModel = pointCloudModel.getCdfToDefaultModelTransformation();
      const modelToCdf = cdfToModel.invert();
      const modelCoords = new THREE.Vector4().set(-12.75, -0.6588, 8.2902, 1);
      const cdfCoords = modelCoords.applyMatrix4(modelToCdf);
      const cdfCoords3 = cdfCoords.toArray().slice(0, 3)
      console.log("CDF coordinates", cdfCoords3);

      const annotationRegionBox = [
        {
          "box": {
            "matrix": [
              1, 0, 0, -12.75,
              0, 1, 0, -8.2902,
              0, 0, 1, -0.6588,
              0, 0, 0, 1,
            ],
          }
        }
      ];

      const annotationRegionCylinder = [
        {
          "cylinder": {
            "centerA": cdfCoords3,
            "centerB": [
              -12.95, -8.4902, -0.8588,
            ],
            "radius": 1
          }
        }
      ];

      const annotation: AnnotationCreate[] = [{
        annotatedResourceType: 'threedmodel',
        annotatedResourceId: 2145147903679180,
        annotationType: 'pointcloud.BoundingVolume',
        creatingApp: 'point-cloud-annotation',
        creatingAppVersion: '1.0.0',
        creatingUser: 'test-app-reveal',
        data: {
          region: annotationRegionBox,
        },
        status: 'suggested',
      }];


      //const res = await client.annotations.create(annotation);
      //console.log("Annotation was created", res);

      // Retrieve events connected to our site id
      const metadataFilter: Metadata = { "site_id": "blk-outdoor-1" }
      const image360events = await client.events.list({ filter: { metadata: metadataFilter }, limit: 1000 })
      console.log(image360events.items[7].metadata?.site_id)
      // Retrieval of events stop here

      // Retrieve files connected to the specific element
      const siteID: string = String(image360events.items[8].metadata?.site_id);
      const stationID = "blk-outdoor-1-0000000000000009" //String(image360events.items[8].metadata?.station_id);
      console.log(typeof siteID)
      console.log(typeof stationID)
      const files = await client.files.list({
        filter: {
          uploaded: true,
          metadata: {
            site_id: siteID,
            station_id: stationID,
            image_type: "cubemap"
          }
        }
      });
      console.log(files.items)
      // Retrieval of files stop here


      // Add bounding volume demo object
      //const point = new THREE.Vector3(1.0312282228469849, 26.17738162994385, -3.68) THIS IS FOR BORGLAND DOLPHIN
      const point = new THREE.Vector3(-12.75, -0.6588, 8.2902) // for blk-outdoors
      const test_box = new THREE.Mesh(new THREE.BoxGeometry(1.65, 2.2, 0.5), new THREE.MeshBasicMaterial({
        color: 'orange', transparent: true,
        opacity: 0.7
      }));
      test_box.position.copy(point);
      //viewer.addObject3D(test_box);
      // Adding bounding volume stops here

      // Create overlay for annotation
      // Translation for station id blk-outdoor-1-0000000000000009 from event
      const x_event = -12994.7998046875;
      const y_event = -10324.2998046875;
      const z_event = -2.487809896469116;
      // Convert to Reveal point coordinates in [m]
      const x = x_event / 1000;
      const y = y_event / 1000;
      const z = z_event / 1000;
      // Coordinates of bounding box, from annotation in 2D image
      /* {"xMax":0.2768595041322314,"xMin":0.20330578512396694,"yMax":0.5694214876033058,"yMin":0.5165289256198347},*/
      const x_max = 0.2768595041322314;
      const y_max = 0.5694214876033058;
      const x_min = 0.20330578512396694;
      const y_min = 0.5165289256198347;
      const x_mid = x_min + (x_max - x_min) / 2; // percent
      const y_mid = y_min + (y_max - y_min) / 2; // percent
      // Angle axis from event
      const x_axis = 0.002779843518510461;
      const y_axis = -0.006474642548710108;
      const z_axis = 0.9999753832817078;
      const axis_angle_deg = -11.88000937500938;
      const axis_angle_rad = (axis_angle_deg * (Math.PI / 180));



      // Length of cubeface 
      const cubeface_length = 1; // by changing to length=1 it looks good inside the correct 360 image, but not so good from the other images. But the most important is that it looks good inside the correct image.
      const cubeface_length_unit = 1;

      // Place the location of the scanner using the translation coordinates
      const scanner_location_cdf = new THREE.Vector3(x, y, z);
      const scanner_location_reveal = pointCloudModel.mapPointFromCdfToModelCoordinates(scanner_location_cdf);
      const scanner_location_3D = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 'red', transparent: true, opacity: 0.7 }));
      scanner_location_3D.position.copy(scanner_location_reveal);
      //viewer.addObject3D(scanner_location_3D);
      console.log("Scanner location added at point: ", scanner_location_reveal);

      // Place 3D box at annotation position
      const x_annotation = cubeface_length * x_mid - (cubeface_length / 2);
      const y_annotation = cubeface_length * y_mid - (cubeface_length / 2);
      const annotation_location_cdf = new THREE.Vector3(x + x_annotation, y + cubeface_length / 2, z - y_annotation);
      const annotation_location_reveal = pointCloudModel.mapPointFromCdfToModelCoordinates(annotation_location_cdf);
      const annotation_3D = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 'yellow', transparent: true, opacity: 0.7 }));
      annotation_3D.position.copy(annotation_location_reveal);
      //viewer.addObject3D(annotation_3D);
      console.log("Annotation object added at point: ", annotation_location_reveal);

      // Rotate 3D box for annotation
      const rot_angle = Math.sin(axis_angle_rad) * (cubeface_length / 2);
      const annotation_rotated_cdf = new THREE.Vector3(x + x_annotation - rot_angle, y + cubeface_length / 2, z - y_annotation);
      const annotation_rotated_reveal = pointCloudModel.mapPointFromCdfToModelCoordinates(annotation_rotated_cdf);
      const annotation_3D_rotated = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.1), new THREE.MeshBasicMaterial({ color: 'pink', transparent: true, opacity: 0.7 }));
      annotation_3D_rotated.position.copy(annotation_rotated_reveal);
      //viewer.addObject3D(annotation_3D_rotated);
      console.log("Annotation rotated to point: ", annotation_rotated_reveal);

      // Create 3D object for annotation - using unit cube
      const x_annotation_unit = cubeface_length_unit * x_mid - (cubeface_length_unit / 2);
      const y_annotation_unit = cubeface_length_unit * y_mid - (cubeface_length_unit / 2);
      const annotation_location_unit_cdf = new THREE.Vector3(x + x_annotation_unit, y + cubeface_length_unit / 2, z - y_annotation_unit);
      const annotation_location_unit_reveal = pointCloudModel.mapPointFromCdfToModelCoordinates(annotation_location_unit_cdf);
      const annotation_unit_3D = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: 'yellow', transparent: true, opacity: 0.7, depthTest: false }));
      annotation_unit_3D.position.copy(annotation_location_unit_reveal);
      //viewer.addObject3D(annotation_unit_3D);
      console.log("Added annotation wrt unit cube at point: ", annotation_location_unit_reveal);

      // Rotate 3D annotation using rotation matrix
      // const elements coming from image360.transform (this one is different for each image)
      const elements = [
        0.20585731571212376,
        -0.0007109440762277856,
        -0.9785817685524737,
        0,
        0.001392428204845938,
        0.9999989454756326,
        -0.0004335884913749857,
        0,
        0.9785810361581991,
        -0.001273347480454545,
        0.2058580867362287,
        0,
        -12.994799804687501,
        -0.002487809896469116,
        10.3242998046875,
        1
      ];

      const image360transform = new THREE.Matrix4().fromArray(elements).multiply(new THREE.Matrix4().makeRotationY(Math.PI * (-1 / 2)));

      const rotated_point = annotation_location_unit_reveal.clone().sub(scanner_location_reveal)
        .applyMatrix4(image360transform);
      rotated_point.clone().sub(scanner_location_reveal)
      //const rotated_point = scanner_location_reveal.clone().sub(annotation_location_unit_reveal)
      //  .transformDirection(image360transform).add(scanner_location_reveal);
      const rotated_point_sphere = new THREE.Mesh(new THREE.SphereGeometry(0.1), new THREE.MeshBasicMaterial({ color: "orange", transparent: true, opacity: 0.7 }));
      rotated_point_sphere.position.copy(rotated_point);
      //viewer.addObject3D(rotated_point_sphere);
      console.log("Annotation rotated using matrix to point: ", rotated_point);
      console.log("Transformation matrix: ", pointCloudModel.getCdfToDefaultModelTransformation())

      // Trigger events on entering 360 image
      // The text on the overlay should be the asset name that I get from CDF
      set.on('image360Entered', (image360: Image360) => { overlayTool.add(createOverlay("123-OFFICE", viewer, client, pointCloudModel), rotated_point), console.log("Entered the 360 image and added HTML overlay.", image360.transform) });
      set.on('image360Exited', () => { overlayTool.clear(), console.log("Removed the html overlay.") });

      entities = entities.concat(set.image360Entities);
      viewer.requestRedraw();
    }

    async function removeAll360Images() {
      await viewer.remove360Images(...entities);
    }
  }

}
