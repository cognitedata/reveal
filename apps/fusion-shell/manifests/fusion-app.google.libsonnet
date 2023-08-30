local _ = import './common.libsonnet';

{
  FusionApp(namespace, hostnames, name, certSecretName, isIAPEnabled):: [
    _.Resource('cloud.google.com/v1beta1', 'BackendConfig', name + '-backend-config', namespace) {
      spec: {
        connectionDraining: {
          drainingTimeoutSec: 60,
        },
        timeoutSec: 3600,
      } + (
        if isIAPEnabled
        then {
          iap: {
            enabled: true,
            oauthclientCredentials: {
              secretName: 'fusion-app-staging-client-secret',
            },
          },
        }
        else {
          cdn: {
            enabled: true,
            cachePolicy: {
              includeHost: true,
              includeProtocol: false,
              includeQueryString: false,
            },
          },
        }
      ),
    },
    _.Resource('networking.gke.io/v1beta1', 'FrontendConfig', name + '-frontend-config', namespace) {
      spec: {
        sslPolicy: 'cognite-ssl-policy',
        redirectToHttps: {
          enabled: true,
        },
      },
    },
    _.Resource('cert-manager.io/v1', 'Certificate', name, namespace) {
      spec: {
        dnsNames: hostnames,
        issuerRef: {
          kind: 'ClusterIssuer',
          name: 'letsencrypt',
        },
        secretName: certSecretName,
      },
    },
    _.Resource('networking.k8s.io/v1', 'Ingress', name + '-ingress', namespace, {
      annotations: {
        'kubernetes.io/ingress.allow-http': 'true',
        'kubernetes.io/ingress.class': 'gce',
        'networking.gke.io/v1beta1.FrontendConfig': name + '-frontend-config',
      },
    }) {
      spec: {
        rules: std.map(function(hostname)
          {
            host: hostname,
            http: {
              paths: [
                {
                  backend: {
                    service: {
                      name: name,
                      port: {
                        number: 80,
                      },
                    },
                  },
                  pathType: 'ImplementationSpecific',
                },
              ],
            },
          }, hostnames),
        tls: [
          {
            hosts: hostnames,
            secretName: certSecretName,
          },
        ],
      },
    },
  ],
}
