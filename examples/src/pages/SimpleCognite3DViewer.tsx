/*
 * Copyright 2021 Cognite AS
 */

import { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';
import { CogniteClient } from '@cognite/sdk';
import {
    CameraState,
    Cognite3DViewer,
    Cognite3DModel,
    Cognite3DViewerOptions,
    DefaultCameraManager,
    THREE,
    CadIntersection
} from '@cognite/reveal';

import { createSDKFromEnvironment } from '../utils/example-helpers';

const pointShaders = {
    vertex: `
    uniform float pointSize;
    attribute vec3 customColor;
    varying vec3 vColor;
    
    void main() {
    
        vColor = customColor;
    
        vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    
        gl_PointSize = pointSize * ( 100.0 / length(mvPosition.xyz) );
    
        gl_Position = projectionMatrix * mvPosition;
    
    }`,
    fragment: `uniform vec3 color;
    uniform float alphaTest;
    
    varying vec3 vColor;
    
    void main() {
    
        gl_FragColor = vec4( color * vColor, 1.0 );
    
        if ( gl_FragColor.a < alphaTest || length( gl_PointCoord - vec2( 0.5, 0.5 ) ) > 0.5) discard;
    
    }`
}

export function SimpleViewer() {

    const url = new URL(window.location.href);
    const urlParams = url.searchParams;
    const environmentParam = urlParams.get('env');

    const canvasWrapperRef = useRef<HTMLDivElement>(null);

    const modelData = {
        modelId: Number.parseInt(urlParams.get('modelId') ?? '4707472960431797', 10),
        revisionId: Number.parseInt(
            urlParams.get('revisionId') ?? '6925547646157227',
            10
        ),
    };

    let viewer: Cognite3DViewer;
    let cameraManager: DefaultCameraManager;
    let currentModel: Cognite3DModel;

    let firstPointCloud: boolean = true;

    const cameraPositions: CameraState[] = [];
    const currentFrame = {
        positions: [] as number[],
        colors: [] as number[],
    };
    const pointsGeometry = new THREE.BufferGeometry();
    const pointsMaterial = new THREE.ShaderMaterial( {
        uniforms: {
            color: { value: new THREE.Color('red') },
            alphaTest: { value: 0.9 },
            pointSize: { value: 1.0 }
        },
        vertexShader: pointShaders.vertex,
        fragmentShader: pointShaders.fragment
    } );

    function captureCurrentPosition() {
        cameraPositions.push(cameraManager.getCameraState());
    }

    async function createPointCloud() {
        const width = canvasWrapperRef.current!.clientWidth;
        const height = canvasWrapperRef.current!.clientHeight;

        for (let x = 0; x < width; x += 25) {
            for (let y = 0; y < height; y += 30) {
                const intersection = await viewer.getIntersectionFromPixel(x, y);

                
                if (intersection) {
                    const color = new THREE.Color('red').multiplyScalar((intersection as CadIntersection).treeIndex/currentModel.nodeCount).toArray();

                    currentFrame.positions.push(intersection.point.x, intersection.point.y, intersection.point.z);
                    currentFrame.colors.push(color[0], color[1], color[2]);
                }
            }
            console.log('Finished row');
        }

        pointsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(currentFrame.positions, 3));
        pointsGeometry.setAttribute('customColor', new THREE.Float32BufferAttribute(currentFrame.colors, 3));

        if (firstPointCloud) {
            const pointsObject = new THREE.Points(pointsGeometry, pointsMaterial);

            viewer.addObject3D(pointsObject);
            firstPointCloud = false;
        }

        viewer.requestRedraw();
        console.log('Finished frame');

    }

    useEffect(() => {

        const project = urlParams.get('project');

        async function main() {
            let client: CogniteClient;
            if (project && environmentParam) {
                client = await createSDKFromEnvironment('reveal.example.example', project, environmentParam);
            } else {
                client = new CogniteClient({
                    appId: 'reveal.example.example',
                    project: 'dummy',
                    getToken: async () => 'dummy'
                });
            }

            let viewerOptions: Cognite3DViewerOptions = {
                sdk: client,
                domElement: canvasWrapperRef.current!,
                logMetrics: false,
                antiAliasingHint: (urlParams.get('antialias') || undefined) as any,
                ssaoQualityHint: (urlParams.get('ssao') || undefined) as any,
                continuousModelStreaming: true
            };

            // Prepare viewer
            viewer = new Cognite3DViewer(viewerOptions);
            cameraManager = viewer.cameraManager as DefaultCameraManager;
            (window as any).viewer = viewer;

            viewer.setBackgroundColor(new THREE.Color('white'));

            cameraManager.setCameraControlsOptions({ mouseWheelAction: 'zoomToCursor', changeCameraTargetOnClick: true });
            const camera = cameraManager.getCamera();

            camera.fov = 80;

            viewer.addCadModel(modelData).then((model) => {
                viewer.loadCameraFromModel(model);
                currentModel = model;
            });
        }

        main();

        return () => {
            delete (window as any).viewer;
            viewer?.dispose();
        };

    });
    
    function onPointSizeChange(event: React.ChangeEvent<HTMLInputElement>) {
        const size = Number.parseFloat(event.target.value);
        if (Number.isFinite(size)) {
            pointsMaterial.uniforms.pointSize.value = size;
        }
    }
    
    return <div>
        <CanvasWrapper ref={canvasWrapperRef} />
        <button onClick={captureCurrentPosition}> Capture position</button>
        <button onClick={createPointCloud}> Create pointcloud</button>
        <button onClick={() => {
            (viewer.models[0] as Cognite3DModel).visible = !(viewer.models[0] as Cognite3DModel).visible;
            viewer.requestRedraw();
            } }> Model visibility</button>

        <input defaultValue={0.5} onChange={onPointSizeChange}></input>
    </div>;
}