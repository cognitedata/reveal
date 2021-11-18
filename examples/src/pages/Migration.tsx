/*
 * Copyright 2021 Cognite AS
 */

import { useEffect, useRef } from 'react';
import { CanvasWrapper } from '../components/styled';
import * as THREE from 'three';
import { CogniteClient, Viewer3DAPI } from '@cognite/sdk';
import dat from 'dat.gui'; 
import {
  AddModelOptions,
  Cognite3DViewer,
  Cognite3DViewerOptions,
  Cognite3DModel,
  CameraControlsOptions,
  CognitePointCloudModel,
  PotreePointColorType,
  PotreePointShape,
  TreeIndexNodeCollection,
  IndexSet,
} from '@cognite/reveal';
import { DebugCameraTool, DebugLoadedSectorsTool, DebugLoadedSectorsToolOptions, ExplodedViewTool, AxisViewTool, HtmlOverlayTool } from '@cognite/reveal/tools';
import * as reveal from '@cognite/reveal';
import { CadNode } from '@cognite/reveal/internals';
import { ClippingUI } from '../utils/ClippingUI';
import { initialCadBudgetUi } from '../utils/CadBudgetUi';
import { authenticateSDKWithEnvironment } from '../utils/example-helpers';
import Peer from 'peerjs';
import { MotionData, Player } from './Playground';

window.THREE = THREE;
(window as any).reveal = reveal;

const phoneCameraData: MotionData[] = [
  {
      "position": {
          "x": -0.0036591701209545135,
          "y": -0.014397894963622093,
          "z": -0.014017380774021149,
          "w": 1
      },
      "rotation": {
          "x": -0.24675855912585204,
          "y": -0.007329523849403078,
          "z": -0.011709749625099419,
          "w": 0.9689785205782386
      },
      "matrix": {
          "0": 0.9996182918548584,
          "1": -0.019075745716691017,
          "2": 0.019983263686299324,
          "3": 0,
          "4": 0.026310237124562263,
          "5": 0.8779461979866028,
          "6": -0.4780358374118805,
          "7": 0,
          "8": -0.008425338193774223,
          "9": 0.47837916016578674,
          "10": 0.8781129717826843,
          "11": 0,
          "12": -0.0036591701209545135,
          "13": -0.014397894963622093,
          "14": -0.014017380774021149,
          "15": 1
      },
      "timestamp": 1637248940856
  },
  {
      "position": {
          "x": -0.0032901265658438206,
          "y": -0.012615498155355453,
          "z": -0.015752384439110756,
          "w": 1
      },
      "rotation": {
          "x": -0.2470121935126051,
          "y": -0.007747166368047811,
          "z": -0.014020174749164187,
          "w": 0.9688799679884811
      },
      "matrix": {
          "0": 0.9994868040084839,
          "1": -0.023340443149209023,
          "2": 0.02193845622241497,
          "3": 0,
          "4": 0.030995020642876625,
          "5": 0.8775768280029297,
          "6": -0.47843310236930847,
          "7": 0,
          "8": -0.00808583851903677,
          "9": 0.4788675606250763,
          "10": 0.8778499364852905,
          "11": 0,
          "12": -0.0032901265658438206,
          "13": -0.012615498155355453,
          "14": -0.015752384439110756,
          "15": 1
      },
      "timestamp": 1637248941844
  },
  {
      "position": {
          "x": -0.03186589106917381,
          "y": 0.11012636870145798,
          "z": -0.0856088325381279,
          "w": 1
      },
      "rotation": {
          "x": -0.24608399879463422,
          "y": -0.034091567799723985,
          "z": 0.004841715320226788,
          "w": 0.968636664769075
      },
      "matrix": {
          "0": 0.9976286292076111,
          "1": 0.02615850418806076,
          "2": 0.06366174668073654,
          "3": 0,
          "4": 0.0073990547098219395,
          "5": 0.8788384199142456,
          "6": -0.47706207633018494,
          "7": 0,
          "8": -0.06842762231826782,
          "9": 0.47640183568000793,
          "10": 0.8765608668327332,
          "11": 0,
          "12": -0.03186589106917381,
          "13": 0.11012636870145798,
          "14": -0.0856088325381279,
          "15": 1
      },
      "timestamp": 1637248942842
  },
  {
      "position": {
          "x": 0.0037158112972974777,
          "y": 0.3063684105873108,
          "z": -0.5475209355354309,
          "w": 1
      },
      "rotation": {
          "x": -0.30168997514964074,
          "y": -0.057544122770619814,
          "z": 0.007197053659504665,
          "w": 0.9516407070146754
      },
      "matrix": {
          "0": 0.9932737350463867,
          "1": 0.04841898754239082,
          "2": 0.10518009960651398,
          "3": 0,
          "4": 0.021022958680987358,
          "5": 0.8178626894950867,
          "6": -0.575029194355011,
          "7": 0,
          "8": -0.1138652116060257,
          "9": 0.5733726024627686,
          "10": 0.8113436698913574,
          "11": 0,
          "12": 0.0037158112972974777,
          "13": 0.3063684105873108,
          "14": -0.5475209355354309,
          "15": 1
      },
      "timestamp": 1637248943846
  },
  {
      "position": {
          "x": 0.14814236760139465,
          "y": 0.5058473348617554,
          "z": -1.1057188510894775,
          "w": 1
      },
      "rotation": {
          "x": -0.3215021931081752,
          "y": -0.11234201552490199,
          "z": -0.02802011941061621,
          "w": 0.9398034285331435
      },
      "matrix": {
          "0": 0.9731882810592651,
          "1": 0.019569600000977516,
          "2": 0.2291758805513382,
          "3": 0,
          "4": 0.12490320205688477,
          "5": 0.7917024493217468,
          "6": -0.5980020761489868,
          "7": 0,
          "8": -0.19314175844192505,
          "9": 0.6105933785438538,
          "10": 0.7680312395095825,
          "11": 0,
          "12": 0.14814236760139465,
          "13": 0.5058473348617554,
          "14": -1.1057188510894775,
          "15": 1
      },
      "timestamp": 1637248944857
  },
  {
      "position": {
          "x": 0.22560220956802368,
          "y": 0.5010625720024109,
          "z": -1.5382914543151855,
          "w": 1
      },
      "rotation": {
          "x": -0.32812402929188045,
          "y": -0.19565108592952038,
          "z": -0.0055910561870547385,
          "w": 0.9241341970009409
      },
      "matrix": {
          "0": 0.9233787655830383,
          "1": 0.11806187033653259,
          "2": 0.36528483033180237,
          "3": 0,
          "4": 0.13872945308685303,
          "5": 0.7846066951751709,
          "6": -0.6042734384536743,
          "7": 0,
          "8": -0.35794660449028015,
          "9": 0.6086490750312805,
          "10": 0.708110511302948,
          "11": 0,
          "12": 0.22560220956802368,
          "13": 0.5010625720024109,
          "14": -1.5382914543151855,
          "15": 1
      },
      "timestamp": 1637248945857
  },
  {
      "position": {
          "x": 0.23024453222751617,
          "y": 0.20619893074035645,
          "z": -0.358511745929718,
          "w": 1
      },
      "rotation": {
          "x": -0.48489274007355876,
          "y": -0.5660196749796884,
          "z": -0.30887742585004985,
          "w": 0.5908430366519445
      },
      "matrix": {
          "0": 0.16843289136886597,
          "1": 0.1839214712381363,
          "2": 0.9684022068977356,
          "3": 0,
          "4": 0.9139137268066406,
          "5": 0.3389475345611572,
          "6": -0.22332929074764252,
          "7": 0,
          "8": -0.36931243538856506,
          "9": 0.9226522445678711,
          "10": -0.11099835485219955,
          "11": 0,
          "12": 0.23024453222751617,
          "13": 0.20619893074035645,
          "14": -0.358511745929718,
          "15": 1
      },
      "timestamp": 1637248946856
  },
  {
      "position": {
          "x": 0.3061644434928894,
          "y": 0.13695913553237915,
          "z": -0.29154300689697266,
          "w": 1
      },
      "rotation": {
          "x": -0.47427255616135383,
          "y": -0.5447765175517975,
          "z": -0.28749201993633183,
          "w": 0.628993185073765
      },
      "matrix": {
          "0": 0.24113371968269348,
          "1": 0.155084028840065,
          "2": 0.9580203890800476,
          "3": 0,
          "4": 0.8784060478210449,
          "5": 0.38482773303985596,
          "6": -0.2833902835845947,
          "7": 0,
          "8": -0.41262197494506836,
          "9": 0.9098660349845886,
          "10": -0.04343171417713165,
          "11": 0,
          "12": 0.3061644434928894,
          "13": 0.13695913553237915,
          "14": -0.29154300689697266,
          "15": 1
      },
      "timestamp": 1637248946977
  },
  {
      "position": {
          "x": 0.3061644434928894,
          "y": 0.13695913553237915,
          "z": -0.29154300689697266,
          "w": 1
      },
      "rotation": {
          "x": -0.47427255616135383,
          "y": -0.5447765175517975,
          "z": -0.28749201993633183,
          "w": 0.628993185073765
      },
      "matrix": {
          "0": 0.24113371968269348,
          "1": 0.155084028840065,
          "2": 0.9580203890800476,
          "3": 0,
          "4": 0.8784060478210449,
          "5": 0.38482773303985596,
          "6": -0.2833902835845947,
          "7": 0,
          "8": -0.41262197494506836,
          "9": 0.9098660349845886,
          "10": -0.04343171417713165,
          "11": 0,
          "12": 0.3061644434928894,
          "13": 0.13695913553237915,
          "14": -0.29154300689697266,
          "15": 1
      },
      "timestamp": 1637248946977
  },
  {
      "position": {
          "x": 0.3061644434928894,
          "y": 0.13695913553237915,
          "z": -0.29154300689697266,
          "w": 1
      },
      "rotation": {
          "x": -0.47427255616135383,
          "y": -0.5447765175517975,
          "z": -0.28749201993633183,
          "w": 0.628993185073765
      },
      "matrix": {
          "0": 0.24113371968269348,
          "1": 0.155084028840065,
          "2": 0.9580203890800476,
          "3": 0,
          "4": 0.8784060478210449,
          "5": 0.38482773303985596,
          "6": -0.2833902835845947,
          "7": 0,
          "8": -0.41262197494506836,
          "9": 0.9098660349845886,
          "10": -0.04343171417713165,
          "11": 0,
          "12": 0.3061644434928894,
          "13": 0.13695913553237915,
          "14": -0.29154300689697266,
          "15": 1
      },
      "timestamp": 1637248946977
  },
  {
      "position": {
          "x": 0.3061644434928894,
          "y": 0.13695913553237915,
          "z": -0.29154300689697266,
          "w": 1
      },
      "rotation": {
          "x": -0.47427255616135383,
          "y": -0.5447765175517975,
          "z": -0.28749201993633183,
          "w": 0.628993185073765
      },
      "matrix": {
          "0": 0.24113371968269348,
          "1": 0.155084028840065,
          "2": 0.9580203890800476,
          "3": 0,
          "4": 0.8784060478210449,
          "5": 0.38482773303985596,
          "6": -0.2833902835845947,
          "7": 0,
          "8": -0.41262197494506836,
          "9": 0.9098660349845886,
          "10": -0.04343171417713165,
          "11": 0,
          "12": 0.3061644434928894,
          "13": 0.13695913553237915,
          "14": -0.29154300689697266,
          "15": 1
      },
      "timestamp": 1637248946977
  },
  {
      "position": {
          "x": 0.3061644434928894,
          "y": 0.13695913553237915,
          "z": -0.29154300689697266,
          "w": 1
      },
      "rotation": {
          "x": -0.47427255616135383,
          "y": -0.5447765175517975,
          "z": -0.28749201993633183,
          "w": 0.628993185073765
      },
      "matrix": {
          "0": 0.24113371968269348,
          "1": 0.155084028840065,
          "2": 0.9580203890800476,
          "3": 0,
          "4": 0.8784060478210449,
          "5": 0.38482773303985596,
          "6": -0.2833902835845947,
          "7": 0,
          "8": -0.41262197494506836,
          "9": 0.9098660349845886,
          "10": -0.04343171417713165,
          "11": 0,
          "12": 0.3061644434928894,
          "13": 0.13695913553237915,
          "14": -0.29154300689697266,
          "15": 1
      },
      "timestamp": 1637248946977
  },
  {
      "position": {
          "x": 0.3061644434928894,
          "y": 0.13695913553237915,
          "z": -0.29154300689697266,
          "w": 1
      },
      "rotation": {
          "x": -0.47427255616135383,
          "y": -0.5447765175517975,
          "z": -0.28749201993633183,
          "w": 0.628993185073765
      },
      "matrix": {
          "0": 0.24113371968269348,
          "1": 0.155084028840065,
          "2": 0.9580203890800476,
          "3": 0,
          "4": 0.8784060478210449,
          "5": 0.38482773303985596,
          "6": -0.2833902835845947,
          "7": 0,
          "8": -0.41262197494506836,
          "9": 0.9098660349845886,
          "10": -0.04343171417713165,
          "11": 0,
          "12": 0.3061644434928894,
          "13": 0.13695913553237915,
          "14": -0.29154300689697266,
          "15": 1
      },
      "timestamp": 1637248946977
  },
  {
      "position": {
          "x": 0.3061644434928894,
          "y": 0.13695913553237915,
          "z": -0.29154300689697266,
          "w": 1
      },
      "rotation": {
          "x": -0.47427255616135383,
          "y": -0.5447765175517975,
          "z": -0.28749201993633183,
          "w": 0.628993185073765
      },
      "matrix": {
          "0": 0.24113371968269348,
          "1": 0.155084028840065,
          "2": 0.9580203890800476,
          "3": 0,
          "4": 0.8784060478210449,
          "5": 0.38482773303985596,
          "6": -0.2833902835845947,
          "7": 0,
          "8": -0.41262197494506836,
          "9": 0.9098660349845886,
          "10": -0.04343171417713165,
          "11": 0,
          "12": 0.3061644434928894,
          "13": 0.13695913553237915,
          "14": -0.29154300689697266,
          "15": 1
      },
      "timestamp": 1637248946977
  },
  {
      "position": {
          "x": 0.3061644434928894,
          "y": 0.13695913553237915,
          "z": -0.29154300689697266,
          "w": 1
      },
      "rotation": {
          "x": -0.47427255616135383,
          "y": -0.5447765175517975,
          "z": -0.28749201993633183,
          "w": 0.628993185073765
      },
      "matrix": {
          "0": 0.24113371968269348,
          "1": 0.155084028840065,
          "2": 0.9580203890800476,
          "3": 0,
          "4": 0.8784060478210449,
          "5": 0.38482773303985596,
          "6": -0.2833902835845947,
          "7": 0,
          "8": -0.41262197494506836,
          "9": 0.9098660349845886,
          "10": -0.04343171417713165,
          "11": 0,
          "12": 0.3061644434928894,
          "13": 0.13695913553237915,
          "14": -0.29154300689697266,
          "15": 1
      },
      "timestamp": 1637248946977
  },
  {
      "position": {
          "x": 0.3061644434928894,
          "y": 0.13695913553237915,
          "z": -0.29154300689697266,
          "w": 1
      },
      "rotation": {
          "x": -0.47427255616135383,
          "y": -0.5447765175517975,
          "z": -0.28749201993633183,
          "w": 0.628993185073765
      },
      "matrix": {
          "0": 0.24113371968269348,
          "1": 0.155084028840065,
          "2": 0.9580203890800476,
          "3": 0,
          "4": 0.8784060478210449,
          "5": 0.38482773303985596,
          "6": -0.2833902835845947,
          "7": 0,
          "8": -0.41262197494506836,
          "9": 0.9098660349845886,
          "10": -0.04343171417713165,
          "11": 0,
          "12": 0.3061644434928894,
          "13": 0.13695913553237915,
          "14": -0.29154300689697266,
          "15": 1
      },
      "timestamp": 1637248946977
  },
  {
      "position": {
          "x": 0.3061644434928894,
          "y": 0.13695913553237915,
          "z": -0.29154300689697266,
          "w": 1
      },
      "rotation": {
          "x": -0.47427255616135383,
          "y": -0.5447765175517975,
          "z": -0.28749201993633183,
          "w": 0.628993185073765
      },
      "matrix": {
          "0": 0.24113371968269348,
          "1": 0.155084028840065,
          "2": 0.9580203890800476,
          "3": 0,
          "4": 0.8784060478210449,
          "5": 0.38482773303985596,
          "6": -0.2833902835845947,
          "7": 0,
          "8": -0.41262197494506836,
          "9": 0.9098660349845886,
          "10": -0.04343171417713165,
          "11": 0,
          "12": 0.3061644434928894,
          "13": 0.13695913553237915,
          "14": -0.29154300689697266,
          "15": 1
      },
      "timestamp": 1637248946977
  },
  {
      "position": {
          "x": 0.3061644434928894,
          "y": 0.13695913553237915,
          "z": -0.29154300689697266,
          "w": 1
      },
      "rotation": {
          "x": -0.47427255616135383,
          "y": -0.5447765175517975,
          "z": -0.28749201993633183,
          "w": 0.628993185073765
      },
      "matrix": {
          "0": 0.24113371968269348,
          "1": 0.155084028840065,
          "2": 0.9580203890800476,
          "3": 0,
          "4": 0.8784060478210449,
          "5": 0.38482773303985596,
          "6": -0.2833902835845947,
          "7": 0,
          "8": -0.41262197494506836,
          "9": 0.9098660349845886,
          "10": -0.04343171417713165,
          "11": 0,
          "12": 0.3061644434928894,
          "13": 0.13695913553237915,
          "14": -0.29154300689697266,
          "15": 1
      },
      "timestamp": 1637248946977
  },
  {
      "position": {
          "x": 0.3061644434928894,
          "y": 0.13695913553237915,
          "z": -0.29154300689697266,
          "w": 1
      },
      "rotation": {
          "x": -0.47427255616135383,
          "y": -0.5447765175517975,
          "z": -0.28749201993633183,
          "w": 0.628993185073765
      },
      "matrix": {
          "0": 0.24113371968269348,
          "1": 0.155084028840065,
          "2": 0.9580203890800476,
          "3": 0,
          "4": 0.8784060478210449,
          "5": 0.38482773303985596,
          "6": -0.2833902835845947,
          "7": 0,
          "8": -0.41262197494506836,
          "9": 0.9098660349845886,
          "10": -0.04343171417713165,
          "11": 0,
          "12": 0.3061644434928894,
          "13": 0.13695913553237915,
          "14": -0.29154300689697266,
          "15": 1
      },
      "timestamp": 1637248946977
  },
  {
      "position": {
          "x": 0.3061644434928894,
          "y": 0.13695913553237915,
          "z": -0.29154300689697266,
          "w": 1
      },
      "rotation": {
          "x": -0.47427255616135383,
          "y": -0.5447765175517975,
          "z": -0.28749201993633183,
          "w": 0.628993185073765
      },
      "matrix": {
          "0": 0.24113371968269348,
          "1": 0.155084028840065,
          "2": 0.9580203890800476,
          "3": 0,
          "4": 0.8784060478210449,
          "5": 0.38482773303985596,
          "6": -0.2833902835845947,
          "7": 0,
          "8": -0.41262197494506836,
          "9": 0.9098660349845886,
          "10": -0.04343171417713165,
          "11": 0,
          "12": 0.3061644434928894,
          "13": 0.13695913553237915,
          "14": -0.29154300689697266,
          "15": 1
      },
      "timestamp": 1637248946977
  }
];

export function Migration() {
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const gui = new dat.GUI({ width: Math.min(500, 0.8 * window.innerWidth) });
    let viewer: Cognite3DViewer;

    function createGeometryFilter(input: string | null): { center: THREE.Vector3, size: THREE.Vector3 } | undefined {
      if (input === null) return undefined;
      const parsed = JSON.parse(input) as { center: THREE.Vector3, size: THREE.Vector3 };
      return { center: new THREE.Vector3().copy(parsed.center), size: new THREE.Vector3().copy(parsed.size) };
    }

    async function main() {
      const url = new URL(window.location.href);
      const urlParams = url.searchParams;
      const project = urlParams.get('project');
      const geometryFilterInput = urlParams.get('geometryFilter');
      const geometryFilter = createGeometryFilter(geometryFilterInput);
      const modelUrl = urlParams.get('modelUrl');

      const environmentParam = urlParams.get('env');
      if (!modelUrl && !(environmentParam && project)) {
        throw Error('Must specify URL parameters "project" and "env", or "modelUrl"');
      }

      const progress = (itemsLoaded: number, itemsRequested: number, itemsCulled: number) => {
        guiState.debug.loadedSectors.statistics.culledCount = itemsCulled;
        if (itemsLoaded === 0 || itemsLoaded === itemsRequested) {
          console.log(`loaded ${itemsLoaded}/${itemsRequested} (culled: ${itemsCulled})`);
        }
      };

      // Login
      const client = new CogniteClient({ appId: 'cognite.reveal.example' });
      let viewerOptions: Cognite3DViewerOptions = {
        sdk: client,
        domElement: canvasWrapperRef.current!,
        onLoading: progress,
        logMetrics: false,
        antiAliasingHint: (urlParams.get('antialias') || undefined) as any,
        ssaoQualityHint: (urlParams.get('ssao') || undefined) as any
      };
      
      if (project && environmentParam) {
        await authenticateSDKWithEnvironment(client, project, environmentParam);
      } else if (modelUrl !== null) {
        viewerOptions = {
          ...viewerOptions,
          // @ts-expect-error
          _localModels: true
        };
      } else {
        throw new Error('Must either provide URL parameters "env", "project", ' +
          '"modelId" and "revisionId" to load model from CDF ' +
          '"or "modelUrl" to load model from URL.');
      }
      
      // Prepare viewer
      viewer = new Cognite3DViewer(viewerOptions);
      (window as any).viewer = viewer;

      const threeScene = viewer.getScene();
      // Configure connection to the phone
      const peer = new Peer('RevealHackathonTestPeerId1_1034')

      peer.on('connection', (connection) => {
        console.log('Connection established!');
        connection.on('data', (data) => {
          //const cube = threeScene.getObjectByName('testCube');

          console.log(data);
        });
      });

      const controlsOptions: CameraControlsOptions = {
        onClickTargetChange: false,
        mouseWheelAction: 'zoomToCursor',
      }

      viewer.setCameraControlsOptions(controlsOptions);

      const totalBounds = new THREE.Box3();

      const pointCloudParams = {
        pointSize: 1.0,
        budget: 2_000_000,
        pointColorType: PotreePointColorType.Rgb,
        pointShape: PotreePointShape.Circle,
        apply: () => {
          viewer.pointCloudBudget = { numberOfPoints: pointCloudParams.budget };
          pointCloudModels.forEach(model => {
            model.pointSize = pointCloudParams.pointSize;
            model.pointColorType = pointCloudParams.pointColorType;
            model.pointShape = pointCloudParams.pointShape;
          });
        }
      };

      async function addModel(options: AddModelOptions) {
        try {
          const model = options.localPath !== undefined ? await viewer.addCadModel(options) : await viewer.addModel(options);
                    const mat = new THREE.Matrix4();
          mat.set(1,
            0,
            0,
            0,
            0,
            2.220446049250313e-16,
            -1,
            0,
            0,
            1,
            2.220446049250313e-16,
            0,
            0,
            0,
            0,
            1);
          model.setModelTransformation(mat);
          const bounds = model.getModelBoundingBox();
          totalBounds.expandByPoint(bounds.min);
          totalBounds.expandByPoint(bounds.max);
          clippingUi.updateWorldBounds(totalBounds);

          viewer.loadCameraFromModel(model);
          if (model instanceof Cognite3DModel) {
            cadModels.push(model);
          } else if (model instanceof CognitePointCloudModel) {
            pointCloudModels.push(model);
            pointCloudParams.apply();
          }
          if (createGeometryFilterFromState(guiState.geometryFilter) === undefined) {
            createGeometryFilterStateFromBounds(bounds, guiState.geometryFilter);
            geometryFilterGui.updateDisplay();
          }
        } catch (e) {
          console.error(e);
          alert(`Model ID is invalid or is not supported`);
        }
      }

      // Add GUI for loading models and such
      const cadModels: Cognite3DModel[] = [];
      const pointCloudModels: CognitePointCloudModel[] = [];
      const guiState = {
        modelId: 0,
        revisionId: 0,
        geometryFilter:
          geometryFilter !== undefined
            ? { ...geometryFilter, enabled: true }
            : { center: new THREE.Vector3(), size: new THREE.Vector3(), enabled: false },
        antiAliasing: urlParams.get('antialias'),
        ssaoQuality: urlParams.get('ssao'),
        debug: {
          stats: {
            drawCalls: 0,
            points: 0,
            triangles: 0,
            geometries: 0,
            textures: 0,
            renderTime: 0
          },
          loadedSectors: {
            options: {
              showSimpleSectors: true,
              showDetailedSectors: true,
              showDiscardedSectors: false,
              colorBy: 'lod',
              leafsOnly: false,
              sectorPathFilterRegex: '^.*/$'
            } as DebugLoadedSectorsToolOptions,
            tool: new DebugLoadedSectorsTool(viewer),
            statistics: {
              insideSectors: 0,
              maxSectorDepth: 0,
              maxSectorDepthOfInsideSectors: 0,
              simpleSectorCount: 0,
              detailedSectorCount: 0,
              culledCount: 0,
              forceDetailedSectorCount: 0,
              downloadSizeMb: 0
            }
          },
          suspendLoading: false,
          ghostAllNodes: false,
          hideAllNodes: false
        },
        showCameraTool: new DebugCameraTool(viewer),
        renderMode: 'Color',
        controls: {
          mouseWheelAction: 'zoomToCursor',
          onClickTargetChange: true
        },
        debugRenderStageTimings: false
      };
      const guiActions = {
        addModel: () =>
          addModel({
            modelId: guiState.modelId,
            revisionId: guiState.revisionId,
            geometryFilter: guiState.geometryFilter.enabled ? createGeometryFilterFromState(guiState.geometryFilter) : undefined
          }),
        fitToModel: () => {
          const model = cadModels[0] || pointCloudModels[0];
          viewer.fitCameraToModel(model);
        },
        showSectorBoundingBoxes: () => {
          const { tool, options } = guiState.debug.loadedSectors;
          tool.setOptions(options);
          if (cadModels.length > 0) {
            tool.showSectorBoundingBoxes(cadModels[0]);
          }
        },
        showCameraHelper: () => {
          guiState.showCameraTool.showCameraHelper();
        },
        showBoundsForAllGeometries: () => {
          cadModels.forEach(m => showBoundsForAllGeometries(m));
        },
        applyGeometryFilter: () => {
          urlParams.set('geometryFilter', JSON.stringify(guiState.geometryFilter));
          window.location.href = url.toString();
        },
        resetGeometryFilter: () => {
          urlParams.delete('geometryFilter');
          window.location.href = url.toString();
        }
      };

      const modelGui = gui.addFolder('Model');
      modelGui.add(guiState, 'modelId').name('Model ID');
      modelGui.add(guiState, 'revisionId').name('Revision ID');
      modelGui.add(guiActions, 'addModel').name('Load model');
      modelGui.add(guiActions, 'fitToModel').name('Fit camera');
      initialCadBudgetUi(viewer, gui.addFolder('CAD budget'));

      const geometryFilterGui = modelGui.addFolder('Geometry Filter');
      let geometryFilterPreview: THREE.Object3D | undefined = undefined;
      function updateGeometryFilterPreview() {
        if (geometryFilterPreview) {
          viewer.removeObject3D(geometryFilterPreview);
        }
        const geometryFilter = createGeometryFilterFromState(guiState.geometryFilter);
        if (geometryFilter) {
          geometryFilterPreview = new THREE.Box3Helper(geometryFilter.boundingBox, new THREE.Color('cyan'));
          viewer.addObject3D(geometryFilterPreview);
        }
      }
      geometryFilterGui.add(guiState.geometryFilter.center, 'x', -1000, 1000, 1).name('CenterX').onChange(updateGeometryFilterPreview);
      geometryFilterGui.add(guiState.geometryFilter.center, 'y', -1000, 1000, 1).name('CenterY').onChange(updateGeometryFilterPreview);
      geometryFilterGui.add(guiState.geometryFilter.center, 'z', -1000, 1000, 1).name('CenterZ').onChange(updateGeometryFilterPreview);
      geometryFilterGui.add(guiState.geometryFilter.size, 'x', 0, 100, 1).name('SizeX').onChange(updateGeometryFilterPreview);
      geometryFilterGui.add(guiState.geometryFilter.size, 'y', 0, 100, 1).name('SizeY').onChange(updateGeometryFilterPreview);
      geometryFilterGui.add(guiState.geometryFilter.size, 'z', 0, 100, 1).name('SizeZ').onChange(updateGeometryFilterPreview);
      geometryFilterGui.add(guiState.geometryFilter, 'enabled').name('Apply to new models?');
      geometryFilterGui.add(guiActions, 'applyGeometryFilter').name('Apply and reload');
      geometryFilterGui.add(guiActions, 'resetGeometryFilter').name('Reset and reload');

      const renderGui = gui.addFolder('Rendering');
      const renderModes = ['Color', 'Normal', 'TreeIndex', 'PackColorAndNormal', 'Depth', 'Effects', 'Ghost', 'LOD', 'DepthBufferOnly (N/A)', 'GeometryType'];
      renderGui.add(guiState, 'renderMode', renderModes).name('Render mode').onFinishChange(value => {
        const renderMode = renderModes.indexOf(value) + 1;
        cadModels.forEach(m => {
          const cadNode: CadNode = (m as any).cadNode;
          cadNode.renderMode = renderMode;
        });
        viewer.requestRedraw();
      });
      renderGui.add(guiState, 'antiAliasing',
        [
          'disabled', 'fxaa', 'msaa4', 'msaa8', 'msaa16',
          'msaa4+fxaa', 'msaa8+fxaa', 'msaa16+fxaa'
        ]).name('Anti-alias').onFinishChange(v => {
          urlParams.set('antialias', v);
          window.location.href = url.toString();
        });
      renderGui.add(guiState, 'ssaoQuality',
        [
          'disabled', 'medium', 'high', 'veryhigh'
        ]).name('SSAO').onFinishChange(v => {
          urlParams.set('ssao', v);
          window.location.href = url.toString();
        });
      renderGui.add(guiState, 'debugRenderStageTimings')
        .name('Debug timings')
        .onChange(enabled => {
          (viewer as any).revealManager.debugRenderTiming = enabled;
        });

      const debugGui = gui.addFolder('Debug');
      const debugStatsGui = debugGui.addFolder('Statistics');
      debugStatsGui.add(guiState.debug.stats, 'drawCalls').name('Draw Calls');
      debugStatsGui.add(guiState.debug.stats, 'points').name('Points');
      debugStatsGui.add(guiState.debug.stats, 'triangles').name('Triangles');
      debugStatsGui.add(guiState.debug.stats, 'geometries').name('Geometries');
      debugStatsGui.add(guiState.debug.stats, 'textures').name('Textures');
      debugStatsGui.add(guiState.debug.stats, 'renderTime').name('Ms/frame');

      viewer.on('sceneRendered', sceneRenderedEventArgs => {
        guiState.debug.stats.drawCalls = sceneRenderedEventArgs.renderer.info.render.calls;
        guiState.debug.stats.points = sceneRenderedEventArgs.renderer.info.render.points;
        guiState.debug.stats.triangles = sceneRenderedEventArgs.renderer.info.render.triangles;
        guiState.debug.stats.geometries = sceneRenderedEventArgs.renderer.info.memory.geometries;
        guiState.debug.stats.textures = sceneRenderedEventArgs.renderer.info.memory.textures;
        guiState.debug.stats.renderTime = sceneRenderedEventArgs.renderTime;
        debugStatsGui.updateDisplay();
      });

      const debugSectorsGui = debugGui.addFolder('Loaded sectors');

      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'colorBy', ['lod', 'depth', 'loadedTimestamp', 'random']).name('Color by');
      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'leafsOnly').name('Leaf nodes only');
      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'showSimpleSectors').name('Show simple sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'showDetailedSectors').name('Show detailed sectors');      
      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'showDiscardedSectors').name('Show discarded sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.options, 'sectorPathFilterRegex').name('Sectors path filter');
      debugSectorsGui.add(guiActions, 'showSectorBoundingBoxes').name('Show sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'insideSectors').name('# sectors@camera');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'maxSectorDepthOfInsideSectors').name('Max sector depth@camera');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'maxSectorDepth').name('Max sector tree depth');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'simpleSectorCount').name('# simple sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'detailedSectorCount').name('# detailed sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'forceDetailedSectorCount').name('# force detailed sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'culledCount').name('# culled sectors');
      debugSectorsGui.add(guiState.debug.loadedSectors.statistics, 'downloadSizeMb').name('Download size (Mb)');

      setInterval(() => {
        let insideSectors = 0;
        let maxInsideDepth = -1;
        let maxDepth = -1;
        const cameraPosition = viewer.getCameraPosition();
        cadModels.forEach(m => {
          m.traverse(x => {
            // Hacky way to access internals of SectorNode
            const depth = (x.hasOwnProperty('depth') && typeof (x as any).depth === 'number') ? (x as any).depth as number : 0;
            if (x.hasOwnProperty('bounds') && (x as any).bounds instanceof THREE.Box3 && (x as any).bounds.containsPoint(cameraPosition)) {
              insideSectors++;
              maxInsideDepth = Math.max(maxInsideDepth, depth);
            }
            maxDepth = Math.max(maxDepth, depth);
          })
        });
        guiState.debug.loadedSectors.statistics.insideSectors = insideSectors;
        guiState.debug.loadedSectors.statistics.maxSectorDepth = maxDepth;
        guiState.debug.loadedSectors.statistics.maxSectorDepthOfInsideSectors = maxInsideDepth;
        // @ts-expect-error
        const loadedStats = viewer.revealManager.cadLoadedStatistics;
        guiState.debug.loadedSectors.statistics.simpleSectorCount = loadedStats.simpleSectorCount;
        guiState.debug.loadedSectors.statistics.detailedSectorCount = loadedStats.detailedSectorCount;
        guiState.debug.loadedSectors.statistics.forceDetailedSectorCount = loadedStats.forcedDetailedSectorCount;
        guiState.debug.loadedSectors.statistics.downloadSizeMb = loadedStats.downloadSize / 1024 / 1024;

        debugSectorsGui.updateDisplay();
      }, 500);

      debugGui.add(guiActions, 'showCameraHelper').name('Show camera');
      debugGui.add(guiActions, 'showBoundsForAllGeometries').name('Show geometry bounds');
      debugGui.add(guiState.debug, 'suspendLoading').name('Suspend loading').onFinishChange(suspend => {
        try {
          // @ts-expect-error
          viewer.revealManager._cadManager._cadModelUpdateHandler.updateLoadingHints({ suspendLoading: suspend })
        }
        catch (error) {
          alert('Could not toggle suspend loading, check console for error');
          throw error;
        }
      });
      debugGui.add(guiState.debug, 'ghostAllNodes').name('Ghost all nodes').onFinishChange(ghost => {
        cadModels.forEach(m => m.setDefaultNodeAppearance({ renderGhosted: ghost }));
      });
      debugGui.add(guiState.debug, 'hideAllNodes').name('Hide all nodes').onFinishChange(hide => {
        cadModels.forEach(m => m.setDefaultNodeAppearance({ visible: !hide }));
      });

      const clippingUi = new ClippingUI(gui.addFolder('Slicing'), planes => viewer.setSlicingPlanes(planes));


      const pcSettings = gui.addFolder('Point clouds');
      pcSettings.add(pointCloudParams, 'budget', 0, 20_000_000, 100_000).onFinishChange(() => pointCloudParams.apply());
      pcSettings.add(pointCloudParams, 'pointSize', 0, 20, 0.25).onFinishChange(() => pointCloudParams.apply());
      pcSettings.add(pointCloudParams, 'pointColorType', {
        Rgb: PotreePointColorType.Rgb,
        Depth: PotreePointColorType.Depth,
        Height: PotreePointColorType.Height,
        PointIndex: PotreePointColorType.PointIndex,
        LevelOfDetail: PotreePointColorType.LevelOfDetail,
        Classification: PotreePointColorType.Classification,
      }).onFinishChange(valueStr => {
        pointCloudParams.pointColorType = parseInt(valueStr, 10);
        pointCloudParams.apply()
      });
      pcSettings.add(pointCloudParams, 'pointShape', {
        Circle: PotreePointShape.Circle,
        Square: PotreePointShape.Square
      }).onFinishChange(valueStr => {
        pointCloudParams.pointShape = parseInt(valueStr, 10);
        pointCloudParams.apply()
      });

      // Load model if provided by URL
      const modelIdStr = urlParams.get('modelId');
      const revisionIdStr = urlParams.get('revisionId');
      if (modelIdStr && revisionIdStr) {
        const modelId = Number.parseInt(modelIdStr, 10);
        const revisionId = Number.parseInt(revisionIdStr, 10);
        await addModel({ modelId, revisionId, geometryFilter: createGeometryFilterFromState(guiState.geometryFilter) });
      } else if (modelUrl) {
        await addModel({ modelId: -1, revisionId: -1, localPath: modelUrl, geometryFilter: createGeometryFilterFromState(guiState.geometryFilter) })
      }

      const selectedSet = new TreeIndexNodeCollection([]);

      let expandTool: ExplodedViewTool | null;
      let explodeSlider: dat.GUIController | null;

      const assetExplode = gui.addFolder('Asset Inspect');

      const explodeParams = { explodeFactor: 0.0, rootTreeIndex: 0 };
      const explodeActions = {
        selectAssetTreeIndex: async () => {
          if (expandTool) {
            explodeActions.reset();
          }

          const rootTreeIndex = explodeParams.rootTreeIndex;
          const treeIndices = await cadModels[0].getSubtreeTreeIndices(rootTreeIndex);
          cadModels[0].setDefaultNodeAppearance({ visible: false });
          const explodeSet = new TreeIndexNodeCollection(treeIndices);
          cadModels[0].assignStyledNodeCollection(explodeSet, { visible: true });

          const rootBoundingBox = await cadModels[0].getBoundingBoxByTreeIndex(rootTreeIndex);
          viewer.fitCameraToBoundingBox(rootBoundingBox, 0);

          expandTool = new ExplodedViewTool(rootTreeIndex, cadModels[0]);

          await expandTool.readyPromise;

          explodeSlider = assetExplode
            .add(explodeParams, 'explodeFactor', 0, 1)
            .name('Explode Factor')
            .step(0.01)
            .onChange(p => {
              expandTool!.expand(p);
            });
        },
        reset: () => {
          expandTool?.reset();
          cadModels[0].setDefaultNodeAppearance({ visible: true });
          cadModels[0].removeAllStyledNodeCollections();
          explodeParams.explodeFactor = 0;
          expandTool = null;
          if (explodeSlider) {
            assetExplode.remove(explodeSlider);
            explodeSlider = null;
          }
        }
      };
      assetExplode.add(explodeParams, 'rootTreeIndex').name('Tree index');
      assetExplode.add(explodeActions, 'selectAssetTreeIndex').name('Inspect tree index');

      assetExplode.add(explodeActions, 'reset').name('Reset');

      const controlsGui = gui.addFolder('Camera controls');
      const mouseWheelActionTypes = ['zoomToCursor', 'zoomPastCursor', 'zoomToTarget'];
      controlsGui.add(guiState.controls, 'mouseWheelAction', mouseWheelActionTypes).name('Mouse wheel action type').onFinishChange(value => {
        viewer.setCameraControlsOptions({ ...viewer.getCameraControlsOptions(), mouseWheelAction: value });
      });
      controlsGui.add(guiState.controls, 'onClickTargetChange').name('Change camera target on mouse click').onFinishChange(value => {
        viewer.setCameraControlsOptions({ ...viewer.getCameraControlsOptions(), onClickTargetChange: value });
      });

      const overlayTool = new HtmlOverlayTool(viewer);
      new AxisViewTool(viewer);

      // add a cube!
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshBasicMaterial({ color: 'purple' });
      const cube = new THREE.Mesh(geometry, material);
      viewer.getScene().add(cube);

      viewer.on('click', async event => {
        const { offsetX, offsetY } = event;
        console.log('2D coordinates', event);
        const intersection = await viewer.getIntersectionFromPixel(offsetX, offsetY);
        if (intersection !== null) {
          console.log(intersection);
          switch (intersection.type) {
            case 'cad':
              {
                const { treeIndex, point} = intersection;
                console.log(`Clicked node with treeIndex ${treeIndex} at`, point);
                const overlayHtml = document.createElement('div');
                overlayHtml.innerText = `Node ${treeIndex}`;
                overlayHtml.style.cssText = 'background: white; position: absolute; pointer-events: none; user-select: none;'; // possibly need to add other browsers prefixes
                overlayTool.add(overlayHtml, point);
  
                // highlight the object
                selectedSet.updateSet(new IndexSet([treeIndex]));

              }
              break;
            case 'pointcloud':
              {
                const { pointIndex, point } = intersection;
                console.log(`Clicked point with pointIndex ${pointIndex} at`, point);
                const sphere = new THREE.Mesh(new THREE.SphereBufferGeometry(0.1), new THREE.MeshBasicMaterial({ color: 'red' }));
                sphere.position.copy(point);
                viewer.addObject3D(sphere);
              }
              break;
          }
        }
      });
    }

    function showBoundsForAllGeometries(model: Cognite3DModel) {
      const boxes = new THREE.Group();
      model.getModelTransformation(boxes.matrix);
      boxes.matrixWorldNeedsUpdate = true;

      model.traverse(x => {
        if (x instanceof THREE.Mesh) {
          const mesh = x;
          const geometry: THREE.BufferGeometry = mesh.geometry;

          if (geometry.boundingBox !== null) {
            const box = geometry.boundingBox.clone();
            box.applyMatrix4(mesh.matrixWorld);

            const boxHelper = new THREE.Box3Helper(box);
            boxes.add(boxHelper);
          }
        }
      });
      viewer.addObject3D(boxes);
    }

    main();

    return () => {
      gui.destroy();
      viewer?.dispose();
    };
  });

  const handleCameraData = (data: MotionData) => {

  };

  return (
  <div> 
      <CanvasWrapper ref={canvasWrapperRef} />
      <Player isPlaying={false} startTime={1637248940856} seekTime={1637248940856} endTime={1637248946977} motionData={phoneCameraData} handleNewData={handleCameraData} ></Player>
  </div>);
}

function createGeometryFilterStateFromBounds(bounds: THREE.Box3, out: { center: THREE.Vector3, size: THREE.Vector3 }) {
  bounds.getCenter(out.center);
  bounds.getSize(out.size);
  return out;
}

function createGeometryFilterFromState(state: { center: THREE.Vector3, size: THREE.Vector3 }): { boundingBox: THREE.Box3, isBoundingBoxInModelCoordinates: true } | undefined {
  state.size.clamp(new THREE.Vector3(), new THREE.Vector3(Infinity, Infinity, Infinity));
  if (state.size.equals(new THREE.Vector3())) {
    return undefined;
  }
  return { boundingBox: new THREE.Box3().setFromCenterAndSize(state.center, state.size), isBoundingBoxInModelCoordinates: true };
}
