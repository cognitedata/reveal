/*!
 * Copyright 2022 Cognite AS
 */

import * as THREE from 'three';
import { SceneHandler } from '@reveal/utilities';
import assert from 'assert';
import { Image360Face, Image360Texture } from '@reveal/data-providers';
import { Image360Visualization } from './Image360Visualization';
import { KTX2Loader } from 'three-stdlib';
import { BasisTextureLoader } from 'three-stdlib';

type VisualizationState = {
  opacity: number;
  visible: boolean;
  scale: THREE.Vector3;
  renderOrder: number;
};

export class Image360VisualizationBox implements Image360Visualization {
  private readonly _worldTransform: THREE.Matrix4;
  private _visualizationMesh: THREE.Mesh | undefined;
  private _faceMaterials: THREE.MeshBasicMaterial[] = [];
  private readonly _sceneHandler: SceneHandler;
  private readonly _visualizationState: VisualizationState;
  private readonly _textureLoader: THREE.TextureLoader;
  private readonly _ktx2TextureLoader: KTX2Loader;
  private readonly _basisTextureLoader: BasisTextureLoader;
  private readonly _imageBitmapLoader: THREE.ImageBitmapLoader;
  private readonly _faceMaterialOrder: Image360Face['face'][] = ['left', 'right', 'top', 'bottom', 'front', 'back'];

  private readonly _renderer: THREE.WebGLRenderer;
  private readonly _gl: WebGLRenderingContext | WebGL2RenderingContext;

  get opacity(): number {
    return this._visualizationState.opacity;
  }

  set opacity(alpha: number) {
    this._visualizationState.opacity = alpha;

    this._faceMaterials.forEach(material => {
      material.opacity = alpha;
    });
  }

  get visible(): boolean {
    return this._visualizationState.visible;
  }

  set visible(isVisible: boolean) {
    this._visualizationState.visible = isVisible;

    if (this._visualizationMesh === undefined) {
      return;
    }
    this._visualizationMesh.visible = isVisible;
  }

  set scale(newScale: THREE.Vector3) {
    this._visualizationState.scale = newScale;

    if (this._visualizationMesh === undefined) {
      return;
    }

    this._visualizationMesh.scale.copy(newScale);
  }

  set renderOrder(newRenderOrder: number) {
    this._visualizationState.renderOrder = newRenderOrder;

    if (this._visualizationMesh === undefined) {
      return;
    }

    this._visualizationMesh.renderOrder = newRenderOrder;
  }

  constructor(worldTransform: THREE.Matrix4, sceneHandler: SceneHandler, renderer: THREE.WebGLRenderer) {
    this._worldTransform = worldTransform;
    this._sceneHandler = sceneHandler;
    this._textureLoader = new THREE.TextureLoader();
    this._ktx2TextureLoader = new KTX2Loader();
    this._basisTextureLoader = new BasisTextureLoader();
    this._imageBitmapLoader = new THREE.ImageBitmapLoader();
    this._imageBitmapLoader.setOptions({ imageOrientation: 'flipY' });
    this._renderer = renderer;
    this._visualizationState = {
      opacity: 1,
      renderOrder: 3,
      scale: new THREE.Vector3(1, 1, 1),
      visible: true
    };

    this._ktx2TextureLoader.setTranscoderPath('basis/');
    this._ktx2TextureLoader.detectSupport(this._renderer);
    this._basisTextureLoader.setTranscoderPath('basis/');
    this._basisTextureLoader.detectSupport(this._renderer);
    this._gl = this._renderer.getContext();
  }

  public loadImages(textures: Image360Texture[]): void {
    if (this._visualizationMesh) {
      this._faceMaterialOrder.forEach((face, index) => {
        this._faceMaterials[index].map = getFaceTexture(face);
      });
      return;
    }

    this._faceMaterials = this._faceMaterialOrder.map(
      face =>
        new THREE.MeshBasicMaterial({
          side: THREE.BackSide,
          map: getFaceTexture(face),
          depthTest: false,
          opacity: this._visualizationState.opacity,
          transparent: true
        })
    );

    const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
    this._visualizationMesh = new THREE.Mesh(boxGeometry, this._faceMaterials);
    this._visualizationMesh.renderOrder = this._visualizationState.renderOrder;
    this._visualizationMesh.applyMatrix4(this._worldTransform);
    this._visualizationMesh.scale.copy(this._visualizationState.scale);
    this._visualizationMesh.visible = this._visualizationState.visible;
    this._sceneHandler.addCustomObject(this._visualizationMesh);

    function getFaceTexture(face: Image360Face['face']) {
      const texture = textures.find(p => p.face === face);
      assert(texture !== undefined);
      return texture.texture;
    }
  }

  public loadFaceTextures(faces: Image360Face[], compressed: boolean): Promise<Image360Texture[]> {
    return Promise.all(
      faces.map(async image360Face => {
        const blob = new Blob([image360Face.data], { type: image360Face.mimeType });
        const url = window.URL.createObjectURL(blob);
        const startTime = performance.now();
        const faceTexture = compressed ? await getCompressedImage(url) : await getImage(url, this._imageBitmapLoader);
        const endTime = performance.now();
        const resolution = compressed ? 'Compressed' : ' ';
        console.log('Texture loaded: ' + (endTime - startTime).toFixed(4) + ' ' + resolution);
        // Need to horizontally flip the texture since it is being rendered inside a cube
        faceTexture.center.set(0.5, 0.5);
        faceTexture.repeat.set(-1, 1);
        return { face: image360Face.face, texture: faceTexture };
      })
    );

    function getImage(blobUrl: string, imageBitmapLoader: THREE.ImageBitmapLoader): Promise<THREE.Texture> {
      return new Promise(resolve => {
        imageBitmapLoader.load(blobUrl, imageBitmap => {
          resolve(new THREE.CanvasTexture(imageBitmap));
        });
      });
    }

    function getCompressedImage(blobUrl: string): Promise<THREE.Texture> {
      return new Promise(resolve => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        //Scale down to the same width and hight as the icon files from CDF (180).
        canvas.width = 180;
        canvas.height = 180;

        const image = new Image();
        image.src = blobUrl;
        image.onload = () => {
          context!.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(new THREE.CanvasTexture(canvas));
        };
      });
    }
  }

  /*   public temp(url: string){
    const image = new Image();
        image.src = url;
        image.onload = () => {
          const compressedTexture = new THREE.CompressedTexture(
            image,
            texture.repeat,
            texture.offset,
            texture.wrapS,
            texture.wrapT,
            texture.magFilter,
            texture.minFilter,
            texture.format,
            texture.type,
            texture.anisotropy
          );
          context!.drawImage(image, 0, 0, canvas.width, canvas.height);
          resolve(new THREE.CanvasTexture(canvas));
        };
    const normalTexture = await this._textureLoader.loadAsync(url);
    mipmaps: ImageData[],
    width: 1024,
    height: 1024,
    format?: CompressedPixelFormat,
    type?: TextureDataType,
    mapping?: Mapping,
    wrapS?: Wrapping,
    wrapT?: Wrapping,
    magFilter?: TextureFilter,
    minFilter?: TextureFilter,
    anisotropy?: number,
    encoding?: TextureEncoding,
    return new THREE.CompressedTexture();
  } */

  //Chat GPT
  /*   public createCompressedTextureFromPNG(data: ArrayBuffer): Promise<THREE.CompressedTexture> {
    return new Promise((resolve, reject) => {
      // Create a Blob from the PNG data
      const blob = new Blob([data], { type: 'image/png' });
  
      // Use the BasisTextureLoader to create a CompressedTexture from the Blob
      this._basisTextureLoader.fromTexture()
      
      .load(URL.createObjectURL(blob), (texture) => {
            texture.encoding = THREE.sRGBEncoding;
  
            // Convert the Basis texture to a CompressedTexture
            const compressedTexture = new THREE.CompressedTexture(
              texture.mipmaps,
              texture.width,
              texture.height,
              RGB_S3TC_DXT1_Format
            );
  
            resolve(compressedTexture);
          }, undefined, (error) => {
            reject(error);
          });
        });
    }); */

  /*   private loadCompressedTexture(blobUrl: string): Promise<THREE.CompressedTexture> {
    return new Promise((resolve, reject) => {
      this._ktx2TextureLoader.load(
        blobUrl,
        compressedTexture => {
          resolve(compressedTexture);
        },
        progressEvent => {
          console.log(progressEvent);
        },
        errorEvent => {
          reject(errorEvent);
        }
      );
    });
  } */

  // private loadCompressedTexture(image360Face: Image360Face): Promise<THREE.CompressedTexture> {
  //   return new Promise((resolve, reject) => {
  //     const blob = new Blob([image360Face.data], { type: image360Face.mimeType });
  //     this._basisTextureLoader.load(
  //       URL.createObjectURL(blob),
  //       compressedTexture => {
  //         resolve(compressedTexture);
  //       },
  //       progressEvent => {
  //         console.log(progressEvent);
  //       },
  //       errorEvent => {
  //         reject(errorEvent);
  //       }
  //     );
  //   });
  // }

  //https://developer.mozilla.org/en-US/docs/Web/API/WebGL_API/Compressed_texture_formats
  /*   private createCompressedTexture(data: ArrayBuffer): WebGLTexture | undefined {
    const texture = this._gl.createTexture();
    if (!texture) return undefined;

    const width = 180;
    const height = 180;

    this._gl.bindTexture(this._gl.TEXTURE_2D, texture); // create texture object on GPU
    const format = this._gl.getExtension('WEBGL_compressed_texture_s3tc'); // will be null if not supported
    if (format) {
      this._gl.compressedTexImage2D(
        this._gl.TEXTURE_2D,
        0,
        format.COMPRESSED_RGBA_S3TC_DXT1_EXT, // the compressed format we are using
        width,
        height,
        0,
        new DataView(data)
      );
      return texture;
    } */

  //https://stackoverflow.com/questions/8191083/can-one-easily-create-an-html-image-element-from-a-webgl-texture-object
  /*     function createImageFromTexture(texture:WebGLTexture, width, height) {
      // Create a framebuffer backed by the texture
      const framebuffer = this._gl.createFramebuffer();
      this._gl.bindFramebuffer(this._gl.FRAMEBUFFER, framebuffer);
      this._gl.framebufferTexture2D(this._gl.FRAMEBUFFER, this._gl.COLOR_ATTACHMENT0, this._gl.TEXTURE_2D, texture, 0);

      // Read the contents of the framebuffer
      const data = new Uint8Array(width * height * 4);
      this._gl.readPixels(0, 0, width, height, this._gl.RGBA, this._gl.UNSIGNED_BYTE, data);

      this._gl.deleteFramebuffer(framebuffer);

      // Create a 2D canvas to store the result
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error();
      }
      // Copy the pixels to a 2D canvas
      const imageData = context.createImageData(width, height);
      imageData.data.set(data);
      context.putImageData(imageData, 0, 0);

      const img = new Image();
      img.src = canvas.toDataURL();
      return img;
    }
  } */

  public unloadImages(): void {
    if (this._visualizationMesh === undefined) {
      return;
    }
    this._sceneHandler.removeCustomObject(this._visualizationMesh);
    const imageContainerMaterial = this._visualizationMesh.material;
    const materials =
      imageContainerMaterial instanceof THREE.Material ? [imageContainerMaterial] : imageContainerMaterial;

    materials
      .map(material => material as THREE.MeshBasicMaterial)
      .forEach(material => {
        material.map?.dispose();
        material.dispose();
      });

    this._visualizationMesh.geometry.dispose();
    this._visualizationMesh = undefined;
    this._faceMaterials = [];
  }
}
