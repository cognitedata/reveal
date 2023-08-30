{
  local cluster_file = std.extVar('cluster_file'),
  local overlays = import './overlays.jsonnet',

  cluster_config:
    overlays.default
    + (if cluster_file.vendor in overlays.vendors then overlays.vendors[cluster_file.vendor] else {})
    + (if cluster_file.name in overlays.clusters then overlays.clusters[cluster_file.name] else {}),


  cluster_name: cluster_file.name,
  cluster_vendor: cluster_file.vendor,
  app: 'fusion-app-http-container',
  team: 'cdf-ux',
  service: 'fusion-ui',


  Resource(apiVersion, kind, name, namespace, metadata = {}):: {
    apiVersion: apiVersion,
    kind: kind,
    metadata: std.mergePatch({
      namespace: namespace,
      name: name,
      labels: {
        team: $.team,
        app: $.app,
        service: $.service,
      },
    }, metadata),
  },
}
