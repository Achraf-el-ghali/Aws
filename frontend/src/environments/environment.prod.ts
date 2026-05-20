// ============================================================
//  PRODUCTION environment — Frontend déployé sur S3 + CloudFront
//  Backend : EC2 derrière l'API Gateway sur le port 8080
// ============================================================
//  La valeur `apiBaseUrl` peut être surchargée à l'exécution via
//  /assets/config/runtime-config.json (cf. AppConfigService).
//  Cela permet de pousser le même bundle sur plusieurs environnements
//  (dev / staging / prod) sans rebuilder Angular.
// ============================================================

export const environment = {
  production: true,
  apiBaseUrl: '/api',
};
