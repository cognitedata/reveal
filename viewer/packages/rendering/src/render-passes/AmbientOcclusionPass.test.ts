/*!
 * Copyright 2026 Cognite AS
 */

import type { Mesh, RawShaderMaterial, WebGLRenderer } from 'three';
import {
  DepthTexture,
  FloatType,
  LinearFilter,
  Matrix4,
  PerspectiveCamera,
  UnsignedByteType,
  WebGLRenderTarget
} from 'three';
import {
  AMBIENT_OCCLUSION_REFERENCE_HEIGHT,
  AmbientOcclusionPass,
  createDenoiseSamples,
  createHemisphereSamples
} from './AmbientOcclusionPass';
import type { SsaoParameters } from '../rendering/types';
import { getSsaoParametersForQuality } from '../rendering/types';

type RecordedDraw = {
  target: WebGLRenderTarget | null;
  material: RawShaderMaterial;
  uniforms: Record<string, unknown>;
};

function createRendererStub(options: { floatRenderTargets?: boolean; boundTarget?: WebGLRenderTarget | null } = {}) {
  const draws: RecordedDraw[] = [];
  let boundTarget: WebGLRenderTarget | null = options.boundTarget ?? null;
  const renderer = {
    extensions: { has: (name: string) => name !== 'EXT_color_buffer_float' || (options.floatRenderTargets ?? true) },
    getRenderTarget: () => boundTarget,
    setRenderTarget: (target: WebGLRenderTarget | null) => {
      boundTarget = target;
    },
    render: (mesh: Mesh) => {
      const material = mesh.material as RawShaderMaterial;
      const uniforms = Object.fromEntries(
        Object.entries(material.uniforms).map(([name, uniform]) => [name, cloneUniformValue(uniform.value)])
      );
      draws.push({ target: boundTarget, material, uniforms });
    }
  };
  return {
    renderer: renderer as unknown as WebGLRenderer,
    draws,
    get boundTarget() {
      return boundTarget;
    }
  };
}

function cloneUniformValue(value: unknown): unknown {
  return value instanceof Matrix4 ? value.clone() : value;
}

function createParameters(overrides: Partial<SsaoParameters> = {}): SsaoParameters {
  return { ...getSsaoParametersForQuality('high'), ...overrides };
}

describe(AmbientOcclusionPass.name, () => {
  let depthTexture: DepthTexture;
  let camera: PerspectiveCamera;
  let output: WebGLRenderTarget;

  beforeEach(() => {
    depthTexture = new DepthTexture(1920, 1080);
    camera = new PerspectiveCamera(60, 1920 / 1080, 0.1, 1000);
    // Asymmetric frustum, like a WebXR eye
    camera.projectionMatrix.makePerspective(-0.1, 0.05, 0.06, -0.04, 0.1, 1000);
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
    output = new WebGLRenderTarget(1920, 1080);
  });

  describe('parameters', () => {
    test('sets sample counts as shader defines and creates matching sample kernels', () => {
      const pass = new AmbientOcclusionPass(depthTexture, createParameters({ sampleSize: 12, denoiseSampleSize: 6 }));

      const { ambientOcclusion, denoise } = pass.materials;
      expect(ambientOcclusion.defines.SAMPLE_COUNT).toBe(12);
      expect(ambientOcclusion.uniforms.samples.value).toHaveLength(12);
      expect(denoise.defines.DENOISE_SAMPLE_COUNT).toBe(6);
      expect(denoise.uniforms.poissonDisk.value).toHaveLength(6);
    });

    test('changing sample counts recompiles the materials', () => {
      const pass = new AmbientOcclusionPass(depthTexture, createParameters({ sampleSize: 16 }));
      const { ambientOcclusion } = pass.materials;
      const versionBefore = ambientOcclusion.version;

      pass.parameters = createParameters({ sampleSize: 32 });

      expect(ambientOcclusion.defines.SAMPLE_COUNT).toBe(32);
      expect(ambientOcclusion.uniforms.samples.value).toHaveLength(32);
      expect(ambientOcclusion.version).toBeGreaterThan(versionBefore);
    });

    test('half resolution is a shader define on the passes that read the downsampled depth', () => {
      const pass = new AmbientOcclusionPass(depthTexture, createParameters({ halfResolution: true }));
      expect(pass.materials.ambientOcclusion.defines.HALF_RES).toBe(true);
      expect(pass.materials.denoise.defines.HALF_RES).toBe(true);

      pass.parameters = createParameters({ halfResolution: false });
      expect(pass.materials.ambientOcclusion.defines.HALF_RES).toBeUndefined();
      expect(pass.materials.denoise.defines.HALF_RES).toBeUndefined();
    });

    test('is disabled when sample size is 0', () => {
      expect(new AmbientOcclusionPass(depthTexture, getSsaoParametersForQuality('disabled')).enabled).toBe(false);
      expect(new AmbientOcclusionPass(depthTexture, getSsaoParametersForQuality('medium')).enabled).toBe(true);
    });

    test('denoising is skipped when there are no denoise samples or no radius', () => {
      expect(new AmbientOcclusionPass(depthTexture, createParameters({ denoiseIterations: 3 })).denoiseIterations).toBe(
        3
      );
      expect(
        new AmbientOcclusionPass(depthTexture, createParameters({ denoiseIterations: 3, denoiseSampleSize: 0 }))
          .denoiseIterations
      ).toBe(0);
      expect(
        new AmbientOcclusionPass(depthTexture, createParameters({ denoiseIterations: 3, denoiseRadius: 0 }))
          .denoiseIterations
      ).toBe(0);
    });

    test('uses the depth texture from the geometry pass', () => {
      const pass = new AmbientOcclusionPass(depthTexture, createParameters());
      const { depthDownsample, ambientOcclusion, denoise, upsample } = pass.materials;
      expect(depthDownsample.uniforms.tDepth.value).toBe(depthTexture);
      expect(ambientOcclusion.uniforms.tDepth.value).toBe(depthTexture);
      expect(denoise.uniforms.tDepth.value).toBe(depthTexture);
      expect(upsample.uniforms.tDepth.value).toBe(depthTexture);
      expect(upsample.uniforms.tDownsampledDepth.value).toBe(pass.renderTargets.depthDownsample.texture);
    });
  });

  describe('render targets', () => {
    test('are sized to half the render size with half resolution', () => {
      const pass = new AmbientOcclusionPass(depthTexture, createParameters({ halfResolution: true }));

      pass.setSize(1921, 1081);

      const { depthDownsample, ambientOcclusion } = pass.renderTargets;
      expect([depthDownsample.width, depthDownsample.height]).toEqual([960, 540]);
      expect(ambientOcclusion.map(target => [target.width, target.height])).toEqual([
        [960, 540],
        [960, 540]
      ]);
    });

    test('are sized to the render size at full resolution, without a downsampled depth target', () => {
      const pass = new AmbientOcclusionPass(depthTexture, createParameters({ halfResolution: false }));

      pass.setSize(1920, 1080);

      const { depthDownsample, ambientOcclusion } = pass.renderTargets;
      expect([depthDownsample.width, depthDownsample.height]).toEqual([1, 1]);
      expect(ambientOcclusion.map(target => [target.width, target.height])).toEqual([
        [1920, 1080],
        [1920, 1080]
      ]);
    });

    test('are resized when parameters change', () => {
      const pass = new AmbientOcclusionPass(depthTexture, createParameters({ halfResolution: false }));
      pass.setSize(1920, 1080);

      pass.parameters = createParameters({ halfResolution: true });

      expect(pass.renderTargets.ambientOcclusion[0].width).toBe(960);
      expect(pass.renderTargets.depthDownsample.width).toBe(960);
    });

    test('hold no memory when disabled', () => {
      const pass = new AmbientOcclusionPass(depthTexture, getSsaoParametersForQuality('disabled'));

      pass.setSize(1920, 1080);

      const { depthDownsample, ambientOcclusion } = pass.renderTargets;
      for (const target of [depthDownsample, ...ambientOcclusion]) {
        expect([target.width, target.height]).toEqual([1, 1]);
      }
    });

    test('downsampled depth is a float target without depth buffer, AO targets are 8 bit and filterable', () => {
      const pass = new AmbientOcclusionPass(depthTexture, createParameters());
      const { depthDownsample, ambientOcclusion } = pass.renderTargets;

      expect(depthDownsample.texture.type).toBe(FloatType);
      expect(depthDownsample.depthBuffer).toBe(false);
      for (const target of ambientOcclusion) {
        expect(target.texture.type).toBe(UnsignedByteType);
        expect(target.texture.minFilter).toBe(LinearFilter);
        expect(target.depthBuffer).toBe(false);
      }
    });
  });

  describe('render', () => {
    test('does nothing when disabled', () => {
      const pass = new AmbientOcclusionPass(depthTexture, getSsaoParametersForQuality('disabled'));
      const { renderer, draws } = createRendererStub({ boundTarget: output });

      pass.render(renderer, camera);

      expect(draws).toHaveLength(0);
    });

    test('half resolution: downsample, AO, denoise iterations and upsample into the bound target', () => {
      const parameters = createParameters({ halfResolution: true, denoiseIterations: 2, intensity: 3 });
      const pass = new AmbientOcclusionPass(depthTexture, parameters);
      pass.setSize(1920, 1080);
      const stub = createRendererStub({ boundTarget: output });

      pass.render(stub.renderer, camera);

      const { depthDownsample, ambientOcclusion, denoise, upsample } = pass.materials;
      const [first, second] = pass.renderTargets.ambientOcclusion;
      expect(stub.draws.map(draw => draw.material)).toEqual([
        depthDownsample,
        ambientOcclusion,
        denoise,
        denoise,
        upsample
      ]);
      expect(stub.draws.map(draw => draw.target)).toEqual([
        pass.renderTargets.depthDownsample,
        first,
        second,
        first,
        output
      ]);
      expect(stub.draws[1].uniforms.tDepth).toBe(pass.renderTargets.depthDownsample.texture);
      expect(stub.draws[2].uniforms.tAmbientOcclusion).toBe(first.texture);
      expect(stub.draws[3].uniforms.tAmbientOcclusion).toBe(second.texture);
      expect(stub.draws[4].uniforms.tAmbientOcclusion).toBe(first.texture);
      // Intensity is only applied in the last step
      expect(stub.draws.slice(1).map(draw => draw.uniforms.outputExponent)).toEqual([1, 1, 1, 3]);
      expect(stub.boundTarget).toBe(output);
    });

    test('full resolution: the last denoise iteration writes into the bound target', () => {
      const pass = new AmbientOcclusionPass(
        depthTexture,
        createParameters({ halfResolution: false, denoiseIterations: 2, intensity: 2.5 })
      );
      pass.setSize(1920, 1080);
      const stub = createRendererStub({ boundTarget: output });

      pass.render(stub.renderer, camera);

      const { ambientOcclusion, denoise } = pass.materials;
      const [first, second] = pass.renderTargets.ambientOcclusion;
      expect(stub.draws.map(draw => draw.material)).toEqual([ambientOcclusion, denoise, denoise]);
      expect(stub.draws.map(draw => draw.target)).toEqual([first, second, output]);
      expect(stub.draws[0].uniforms.tDepth).toBe(depthTexture);
      expect(stub.draws.map(draw => draw.uniforms.outputExponent)).toEqual([1, 1, 2.5]);
      expect(stub.boundTarget).toBe(output);
    });

    test('full resolution without denoising: AO writes directly into the bound target', () => {
      const pass = new AmbientOcclusionPass(
        depthTexture,
        createParameters({ halfResolution: false, denoiseIterations: 0, intensity: 2 })
      );
      pass.setSize(1920, 1080);
      const stub = createRendererStub({ boundTarget: output });

      pass.render(stub.renderer, camera);

      expect(stub.draws).toHaveLength(1);
      expect(stub.draws[0].target).toBe(output);
      expect(stub.draws[0].uniforms.outputExponent).toBe(2);
    });

    test('radius is in pixels relative to the reference height, and halved at half resolution', () => {
      const parameters = createParameters({ screenSpaceRadius: 20, denoiseRadius: 12, halfResolution: true });
      const pass = new AmbientOcclusionPass(depthTexture, parameters);
      pass.setSize(1000, 2 * AMBIENT_OCCLUSION_REFERENCE_HEIGHT);
      const stub = createRendererStub({ boundTarget: output });

      pass.render(stub.renderer, camera);

      const [, aoDraw, denoiseDraw, , upsampleDraw] = stub.draws;
      expect(aoDraw.uniforms.radius).toBe(20);
      expect(denoiseDraw.uniforms.radius).toBe(20);
      expect(denoiseDraw.uniforms.denoiseRadius).toBe(6);
      expect(upsampleDraw.uniforms.radius).toBe(40);
    });

    test('uses the projection of the camera passed to render', () => {
      const pass = new AmbientOcclusionPass(depthTexture, createParameters());
      pass.setSize(1920, 1080);
      const stub = createRendererStub({ boundTarget: output });

      pass.render(stub.renderer, camera);

      for (const draw of stub.draws) {
        expect((draw.uniforms.cameraProjectionMatrix as Matrix4).equals(camera.projectionMatrix)).toBe(true);
        expect((draw.uniforms.cameraInverseProjectionMatrix as Matrix4).equals(camera.projectionMatrixInverse)).toBe(
          true
        );
      }
    });

    test('falls back to full resolution when float render targets are not supported', () => {
      const pass = new AmbientOcclusionPass(depthTexture, createParameters({ halfResolution: true }));
      pass.setSize(1920, 1080);
      const stub = createRendererStub({ boundTarget: output, floatRenderTargets: false });

      pass.render(stub.renderer, camera);

      expect(pass.usesHalfResolution).toBe(false);
      expect(stub.draws.map(draw => draw.material)).not.toContain(pass.materials.depthDownsample);
      expect(pass.renderTargets.ambientOcclusion[0].width).toBe(1920);
      expect(stub.draws[stub.draws.length - 1].target).toBe(output);
    });
  });

  describe('sample kernels', () => {
    test('hemisphere samples are unit vectors in the +z hemisphere', () => {
      const samples = createHemisphereSamples(16);
      expect(samples).toHaveLength(16);
      for (const sample of samples) {
        expect(sample.length()).toBeCloseTo(1, 5);
        expect(sample.z).toBeGreaterThan(0);
      }
    });

    test('denoise samples are within the unit disk', () => {
      const samples = createDenoiseSamples(8, 11);
      expect(samples).toHaveLength(8);
      for (const sample of samples) {
        expect(sample.length()).toBeLessThanOrEqual(1 + 1e-6);
        expect(sample.length()).toBeGreaterThan(0);
      }
    });
  });
});
