export const cadTestBasePath = '/test/cad/'
export const pointcloudTestBasePath = '/test/pointcloud/'

export enum TestCase {
  default = 'default',
  clipping = 'clipping',
  default_camera = 'default_camera',
  highlight = 'highlight',
  rotate_cad_model = 'rotate_cad_model',
  node_transform = 'node_transform',
  ghost_mode = 'ghost_mode',
  scaled_model = 'scaled_model',
  user_render_target = 'user_render_target',
  point_cloud = 'point_cloud'
}
