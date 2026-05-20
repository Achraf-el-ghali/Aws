// ============================================================
// PRODUCTION environment — Deployed to S3 + CloudFront
// ============================================================
// CloudFront has 2 origins:
//   1. S3 bucket (default behavior) → serves Angular static files
//   2. ALB (path /api/*) → forwards to ECS Fargate microservices
//
// All API URLs use relative paths so the same CloudFront distribution
// handles both static content and API requests.
export const environment = {
  production: true,
  apiUrl: '/api',
  patientsApiUrl: '/api',
  rendezvousApiUrl: '/api',
  dossiersApiUrl: '/api',
};
