// ============================================================
//  DEVELOPMENT environment — `ng serve`
// ============================================================
//  Les chemins relatifs `/api` sont proxifiés par proxy.conf.json
//  vers les microservices locaux (localhost:8001/8002/8003).
// ============================================================

export const environment = {
  production: false,
  apiBaseUrl: '/api',
};
