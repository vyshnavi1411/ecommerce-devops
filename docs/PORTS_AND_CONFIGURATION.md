# Ports and Configuration

## Port Map

The following reflects the deployment configuration recorded during
project work. Re-check the live Compose file and EC2 security group
before submission.

  ------------------------------------------------------------------------
  Component          Host binding / port Purpose          Public exposure
  ---------------- --------------------- ---------------- ----------------
  Host Nginx                       `:80` Public HTTP      Yes, if allowed
                                         reverse proxy    by the EC2
                                                          security group

  Frontend              `127.0.0.1:8080` Storefront       No direct public
  container                              served by Nginx  exposure
                                         container        

  API container         `127.0.0.1:3000` Express API      No direct public
                                                          exposure

  PostgreSQL            Compose internal Application      No
                      network; container database         
                                  `5432`                  

  Prometheus            `127.0.0.1:9090` Metrics and      No
                                         targets          

  Grafana               `127.0.0.1:3001` Monitoring       No
                                         dashboards       

  cAdvisor              `127.0.0.1:8081` Container        No
                                         metrics          

  Blackbox              `127.0.0.1:9115` Endpoint probing No
  Exporter                                                

  Node Exporter         `127.0.0.1:9100` Host metrics     No
  ------------------------------------------------------------------------

Only the required public web entry point should be allowed from the
internet. Keep database and monitoring ports restricted.

## Environment Variables

Use the repository's `.env.example` as the source of truth for the exact
variable names and defaults.

At minimum, deployment configuration includes: - PostgreSQL database
name. - PostgreSQL username. - PostgreSQL password. - Administrative API
token. - Any application/database connection settings defined in
`.env.example`.

Never put real values in this document or commit `.env`. Use GitHub
Actions secrets for CI/CD credentials and the EC2 instance role for AWS
access where configured.

## Deployment Notes

-   Local frontend URL: `http://localhost:8080`
-   Local API URL: `http://localhost:3000`
-   API health: `/health`
-   API readiness: `/ready`
-   EC2 host Nginx currently uses HTTP on port 80.
-   HTTPS is not claimed here; document and verify TLS configuration
    separately if completed.
