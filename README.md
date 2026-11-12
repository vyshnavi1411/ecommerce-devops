# Cloud Deployment & CI/CD – E-Commerce Platform

## Project Overview

This project was developed as part of the **DevOps & Cloud Engineering internship assessment at Algions AI Labs Private Limited**.

The objective is to build and deploy a small Product and Order API using production-oriented DevOps practices, focusing on containerization, CI/CD automation, cloud deployment, monitoring, and recovery.

## Technology Stack

- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Containerization:** Docker, Docker Compose
- **CI/CD:** GitHub Actions
- **Cloud:** AWS EC2, AWS Systems Manager
- **Reverse Proxy:** Nginx
- **Monitoring:** Prometheus, Grafana, Node Exporter, cAdvisor, Blackbox Exporter
- **Backup:** Amazon S3
- **Testing:** Jest, Supertest

## Key Features

- Product listing, search, and details.
- Order creation with quantity and stock validation.
- Idempotency to prevent duplicate orders.
- Prevention of negative inventory.
- Protected admin APIs for product and stock updates.
- Audit logging for administrative operations.
- Health and readiness endpoints.

## DevOps Implementation

- Dockerized application and PostgreSQL database.
- Persistent database storage and container health checks.
- GitHub Actions pipeline for linting, testing, building, and deployment.
- Versioned Docker images published to Docker Hub.
- Automated deployment to AWS EC2 using AWS Systems Manager.
- Nginx reverse proxy configuration.
- Prometheus and Grafana monitoring.
- Automated PostgreSQL backups to Amazon S3.
- Backup restoration and application recovery validation.

## Run Locally

**1. Clone the repository**

```bash
git clone YOUR_REPOSITORY_URL
cd ecommerce-devops
```

**2. Configure environment variables**

```bash
cp .env.example .env
```

Update the required configuration values.

**3. Start the application**

```bash
docker compose up --build -d
```

**4. Verify services**

```bash
docker compose ps
```

- Frontend: `http://localhost:8080`
- API: `http://localhost:3000`
- Health: `http://localhost:3000/health`
- Readiness: `http://localhost:3000/ready`

**5. Stop services**

```bash
docker compose down
```

## Project Validation

The implementation includes validation of:

- Duplicate order prevention using idempotency keys.
- Product stock and order quantity validation.
- Automated test execution through CI.
- Container health and service recovery.
- Database backup and restoration.
- Deployment and rollback procedures.

## Author

**Vyshnavi Kusukuntla**

B.Tech – Computer Science and Engineering

[GitHub](YOUR_GITHUB_PROFILE_URL) | [LinkedIn](YOUR_LINKEDIN_PROFILE_URL)
