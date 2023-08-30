local _ = import './common.libsonnet';
local config = _.cluster_config;
local gcp = import './fusion-app.google.libsonnet';
local openshift = import './fusion-app.openshift.libsonnet';
local cluster_file = std.extVar('cluster_file');

{
  FusionApp(namespace, hostname, hostnames, name, certSecretName, container_image, replicas, isIAPEnabled, allow_iframe, subapps_import_map):: [
    if cluster_file.name == 'cognitedata-production' then [
      gcp.FusionApp(namespace, hostnames, name, certSecretName, isIAPEnabled),
    ],
    if cluster_file.name == 'cognitedata-development' then [
      gcp.FusionApp(namespace, hostnames, name, certSecretName, isIAPEnabled),
    ],
    if cluster_file.vendor == 'openshift' then [
      openshift.FusionApp(namespace, name),
    ],
    _.Resource('v1', 'Service', name, namespace, {
      annotations: {
        'beta.cloud.google.com/backend-config': '{"ports": {"http":"' + name + '-backend-config"}, "default" : "' + name + '-backend-config"}',
        'strategy.spinnaker.io/use-source-capacity': 'true',
      },
    }) {
      apiVersion: 'v1',
      kind: 'Service',
      spec: {
        ports: [
          {
            name: 'http',
            port: 80,
            protocol: 'TCP',
            targetPort: config.LISTEN,
          },
        ],
        selector: {
          app: name,
        },
        type: 'NodePort',
      },
    },
    _.Resource('apps/v1', 'Deployment', name, namespace) {
      metadata+: {
        annotations+: {
          'strategy.spinnaker.io/use-source-capacity': 'true',
        },
      },
      spec: {
        minReadySeconds: 0,
        replicas: replicas,
        revisionHistoryLimit: 5,
        selector: {
          matchLabels: {
            app: name,
          },
        },
        strategy: {
          rollingUpdate: {
            maxSurge: '25%',
            maxUnavailable: '25%',
          },
          type: 'RollingUpdate',
        },
        template: {
          metadata: {
            annotations+: {
              'prometheus.io/scrape': 'true',
            },
            labels: {
              team: _.team,
              app: name,
              service: _.service
            },
          },
          spec: {
            containers: [
              {
                image: container_image,
                imagePullPolicy: 'Always',
                name: name,
                ports: [
                  {
                    containerPort: config.LISTEN,
                    protocol: 'TCP',
                  },
                ],
                resources: {
                  requests: {
                    cpu: '200m',
                    memory: '128Mi',
                  },
                  limits: {
                    cpu: '400m',
                    memory: '256Mi',
                  },
                },
                livenessProbe: {
                  httpGet: {
                    path: '/',
                    port: config.LISTEN,
                  },
                  initialDelaySeconds: 60,
                  periodSeconds: 5,
                },
                readinessProbe: {
                  httpGet: {
                    path: '/',
                    port: config.LISTEN,
                  },
                },
                volumeMounts: [
                  {
                    name: 'nginx-config',
                    mountPath: '/etc/nginx/conf.d/default.conf',
                    subPath: 'nginx.config',
                  },
                ],
              },
            ],
            volumes: [{
              name: 'nginx-config',
              configMap: {
                name: 'nginx-config-file-map',
              },
            }],
          },
        },
      },
    },
    _.Resource('v1', 'ConfigMap', 'nginx-config-file-map', namespace) {
      data: {
        'nginx.config': (config['nginx.conf'] % {
                           ROOT_HEADER: if allow_iframe then "" else "add_header X-Frame-Options SAMEORIGIN always;",
                           SUBAPPS_IMPORT_MAP: subapps_import_map,
                         }),
      },
    },
    _.Resource('autoscaling/v2', 'HorizontalPodAutoscaler', name, namespace) {
      spec: {
        maxReplicas: 5,
        minReplicas: replicas,
        scaleTargetRef: {
          apiVersion: 'apps/v1',
          kind: 'Deployment',
          name: name,
        },
        metrics: [
          {
            type: 'Resource',
            resource: {
              name: 'cpu',
              target: {
                type: 'Utilization',
                averageUtilization: 80,
              },
            },
          },
        ],
      },
    },
  ],
}
