
export function vertexShaderDetailed() {
  return `
    attribute vec3 color;

    varying vec3 v_color;
    varying vec3 v_normal;

    void main() {
      v_color = color;
      v_normal = normalMatrix * normal;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `
}

export function vertexShaderSimple() {
  return `
    attribute vec3 color;
    attribute vec4 matrix0;
    attribute vec4 matrix1;
    attribute vec4 matrix2;
    attribute vec4 matrix3;

    varying vec3 v_color;
    varying vec3 v_normal;

    void main() {
      v_color = color;
      v_normal = normalMatrix * normal;
      mat4 instanceMatrix = mat4(matrix0, matrix1, matrix2, matrix3);
      gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(position, 1.0);
    }
  `
}

export function fragmentShader() {
  return `
      varying vec3 v_color;
      varying vec3 v_normal;

      vec3 rgb2hsv(vec3 c)
      {
          vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
          vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
          vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

          float d = q.x - min(q.w, q.y);
          float e = 1.0e-10;
          return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
      }

      vec3 hsv2rgb(vec3 c)
      {
          vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
          vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
          return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      void main() {
        vec3 color = rgb2hsv(v_color);
        color.z = 0.6 * color.z + 0.2;
        color = hsv2rgb(color);

        // NOTE this is a workaround because the normals appear to be wrong from f3df
        float amplitude = dot(v_normal, vec3(0.0, 0.0, 1.0));
        gl_FragColor = vec4(color * (0.4 + 0.6 * amplitude), 1.0);
      }
  `
}

