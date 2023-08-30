local _ = import './common.libsonnet';
local config = _.cluster_config;

{
  FusionApp(namespace, name):: [
    // for OpenShift this resource will create the route https://<name>-<namespace>.apps.ocp.cognite.c.bitbit.net
    // since our ADFS2016 instance has only allowlisted https://fusion-apps.apps.ocp.cognite.c.bitbit.net, we force 'fusion' as 'name' (no 'fusion-dev' etc.)
    // see https://github.com/cognitedata/adfs-setup-scripts/blob/da10fd8ac7eea6a9961626641d7f220b3afc6e40/adfs-openfield.ps1#L225

  _.Resource('route.openshift.io/v1', 'Route', 'fusion', namespace) {
    spec: {
      tls: {
        insecureEdgeTerminationPolicy: 'Redirect',
        termination: 'edge',
      },
      port: {
        targetPort: 'http',
      },
      to: {
        kind: 'Service',
        name: name,
        weight: 100,
      },
    },
    status: null,
  },
  ],
}
