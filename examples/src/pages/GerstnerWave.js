import * as THREE from 'three';

// import Stats from './jsm/libs/stats.module.js';

// import { GUI } from './jsm/libs/dat.gui.module.js';
// import { OrbitControls } from './jsm/controls/OrbitControls.js';
import { Water } from './Water.js';
import { Sky } from './Sky.js';

import { vertexShader, fragmentShader} from './shaders.js';

let waves = {
      A: { direction: 0, steepness: 0.4, wavelength: 60 },
      B: { direction: 30, steepness: 0.4, wavelength: 30 },
      C: { direction: 60, steepness: 0.4, wavelength: 15 },
};

export class GerstnerWave extends THREE.Object3D {

  getWaveInfo( x, z, time ) {

    const pos = new THREE.Vector3();
    const tangent = new THREE.Vector3( 1, 0, 0 );
    const binormal = new THREE.Vector3( 0, 0, 1 );
    Object.keys( waves ).forEach( ( wave ) => {

      const w = waves[ wave ];
      const k = ( Math.PI * 2 ) / w.wavelength;
      const c = Math.sqrt( 9.8 / k );
      const d = new THREE.Vector2(
        Math.sin( ( w.direction * Math.PI ) / 180 ),
        - Math.cos( ( w.direction * Math.PI ) / 180 )
      );
      const f = k * ( d.dot( new THREE.Vector2( x, z ) ) - c * time );
      const a = w.steepness / k;

      pos.x += d.y * ( a * Math.cos( f ) );
      pos.y += a * Math.sin( f );
      pos.z += d.x * ( a * Math.cos( f ) );

      tangent.x += - d.x * d.x * ( w.steepness * Math.sin( f ) );
      tangent.y += d.x * ( w.steepness * Math.cos( f ) );
      tangent.z += - d.x * d.y * ( w.steepness * Math.sin( f ) );

      binormal.x += - d.x * d.y * ( w.steepness * Math.sin( f ) );
      binormal.y += d.y * ( w.steepness * Math.cos( f ) );
      binormal.z += - d.y * d.y * ( w.steepness * Math.sin( f ) );

    } );

    const normal = binormal.cross( tangent ).normalize();

    return { position: pos, normal: normal };

  }

  constructor(sunSetter) {
    super();
    this.sunSetter = sunSetter;

    // Water

    const waterGeometry = new THREE.PlaneGeometry( 2048, 2048, 512, 512 );

    this.water = new Water( waterGeometry, {
      textureWidth: 512,
      textureHeight: 512,
      waterNormals: new THREE.TextureLoader().load(
        './waternormals.jpg',
        function ( texture ) {

          texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

        }
      ),
      sunDirection: new THREE.Vector3(),
      sunColor: 0xffffff,
      waterColor: 0x001e0f,
      distortionScale: 3.7,
      fog: false
    } );

    let prevWaterOnBefore = this.water.onBeforeRender;

    this.water.onBeforeRender = (...args) => { prevWaterOnBefore(...args); this.onBeforeRender(...args); };

    this.water.rotation.x = - Math.PI / 2;

    this.water.material.onBeforeCompile = function ( shader ) {

      shader.uniforms.waveA = {
        value: [
          Math.sin( ( waves.A.direction * Math.PI ) / 180 ),
          Math.cos( ( waves.A.direction * Math.PI ) / 180 ),
          waves.A.steepness,
          waves.A.wavelength,
        ],
      };
      shader.uniforms.waveB = {
        value: [
          Math.sin( ( waves.B.direction * Math.PI ) / 180 ),
          Math.cos( ( waves.B.direction * Math.PI ) / 180 ),
          waves.B.steepness,
          waves.B.wavelength,
        ],
      };
      shader.uniforms.waveC = {
        value: [
          Math.sin( ( waves.C.direction * Math.PI ) / 180 ),
          Math.cos( ( waves.C.direction * Math.PI ) / 180 ),
          waves.C.steepness,
          waves.C.wavelength,
        ],
      };

    };

    this.add( this.water );

    // Skybox

    const sky = new Sky();
    sky.scale.setScalar( 10000 );
    this.add( sky );

    const skyUniforms = sky.material.uniforms;

    skyUniforms[ 'turbidity' ].value = 10;
    skyUniforms[ 'rayleigh' ].value = 2;
    skyUniforms[ 'mieCoefficient' ].value = 0.005;
    skyUniforms[ 'mieDirectionalG' ].value = 0.8;

    this.sky = sky;
    this.sun = new THREE.Vector3();

    const parameters = {
      elevation: 2,
      azimuth: 180,
    };
    const phi = THREE.MathUtils.degToRad( 90 - parameters.elevation );
    const theta = THREE.MathUtils.degToRad( parameters.azimuth );

    this.sun.setFromSphericalCoords( 1, phi, theta );

    // const pmremGenerator = new THREE.PMREMGenerator( renderer );

    console.log('Water material = ', this.water.material);
    this.water.material.uniforms[ 'sunDirection' ].value.copy( this.sun).normalize();
    this.sky.material.uniforms[ 'sunPosition' ].value.copy( this.sun).normalize();
    // updateSun();


    // stats = new Stats();
    // container.appendChild( stats.dom );

    // GUI

    // const gui = new GUI();

    /* const folderSky = gui.addFolder( 'Sky' );
       folderSky.add( parameters, 'elevation', 0, 90, 0.1 ).onChange( updateSun );
       folderSky.add( parameters, 'azimuth', - 180, 180, 0.1 ).onChange( updateSun );
       folderSky.open(); */

    // const waterUniforms = water.material.uniforms;

    /* const folderWater = gui.addFolder( 'Water' );
    folderWater
      .add( waterUniforms.distortionScale, 'value', 0, 8, 0.1 )
      .name( 'distortionScale' );
    folderWater.add( waterUniforms.size, 'value', 0.1, 10, 0.1 ).name( 'size' );
    folderWater.add( water.material, 'wireframe' );
    folderWater.open();

    const waveAFolder = gui.addFolder( 'Wave A' );
    waveAFolder
      .add( waves.A, 'direction', 0, 359 )
      .name( 'Direction' )
      .onChange( ( v ) => {

        const x = ( v * Math.PI ) / 180;
        water.material.uniforms.waveA.value[ 0 ] = Math.sin( x );
        water.material.uniforms.waveA.value[ 1 ] = Math.cos( x );

      } );
    waveAFolder
      .add( waves.A, 'steepness', 0, 1, 0.1 )
      .name( 'Steepness' )
      .onChange( ( v ) => {

        water.material.uniforms.waveA.value[ 2 ] = v;

      } );
    waveAFolder
      .add( waves.A, 'wavelength', 1, 100 )
      .name( 'Wavelength' )
      .onChange( ( v ) => {

        water.material.uniforms.waveA.value[ 3 ] = v;

      } );
    waveAFolder.open();

    const waveBFolder = gui.addFolder( 'Wave B' );
    waveBFolder
      .add( waves.B, 'direction', 0, 359 )
      .name( 'Direction' )
      .onChange( ( v ) => {

        const x = ( v * Math.PI ) / 180;
        water.material.uniforms.waveB.value[ 0 ] = Math.sin( x );
        water.material.uniforms.waveB.value[ 1 ] = Math.cos( x );

      } );
    waveBFolder
      .add( waves.B, 'steepness', 0, 1, 0.1 )
      .name( 'Steepness' )
      .onChange( ( v ) => {

        water.material.uniforms.waveB.value[ 2 ] = v;

      } );
    waveBFolder
      .add( waves.B, 'wavelength', 1, 100 )
      .name( 'Wavelength' )
      .onChange( ( v ) => {

        water.material.uniforms.waveB.value[ 3 ] = v;

      } );
    waveBFolder.open();

    const waveCFolder = gui.addFolder( 'Wave C' );
    waveCFolder
      .add( waves.C, 'direction', 0, 359 )
      .name( 'Direction' )
      .onChange( ( v ) => {

        const x = ( v * Math.PI ) / 180;
        water.material.uniforms.waveC.value[ 0 ] = Math.sin( x );
        water.material.uniforms.waveC.value[ 1 ] = Math.cos( x );

      } );
    waveCFolder
      .add( waves.C, 'steepness', 0, 1, 0.1 )
      .name( 'Steepness' )
      .onChange( ( v ) => {

        water.material.uniforms.waveC.value[ 2 ] = v;

      } );
    waveCFolder
      .add( waves.C, 'wavelength', 1, 100 )
      .name( 'Wavelength' )
      .onChange( ( v ) => {

        water.material.uniforms.waveC.value[ 3 ] = v;

      } );
    waveCFolder.open();
*/

    this.clock = new THREE.Clock();
    this.time = 0;
  }

  onBeforeRender() {
    this.delta = this.clock.getDelta();
    this.water.material.uniforms[ 'time' ].value += this.delta;

    const phi = THREE.MathUtils.degToRad( -90 + this.time * 3.0 ) % (2 * Math.PI);
    const theta = THREE.MathUtils.degToRad( 180 );


    // Time moves faster at night
    this.time += phi > Math.PI / 2 && phi < 3 * Math.PI / 2 ? this.delta * 2.0 : this.delta;

    this.sun.setFromSphericalCoords( 1, phi, theta );

    this.water.material.uniforms[ 'sunDirection' ].value.copy( this.sun).normalize();
    this.sky.material.uniforms[ 'sunPosition' ].value.copy( this.sun).normalize();
    this.sunSetter(this.sun.normalize());
  }

}
