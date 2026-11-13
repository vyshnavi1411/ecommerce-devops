# Operations Runbook

This runbook records the routine commands and recovery process for the
E-Commerce deployment.

## 1. Deployment

The normal release path is the GitHub Actions workflow on the configured
branch. It builds and publishes versioned images and invokes deployment
on EC2 through AWS Systems Manager.

Before a release: - Confirm the CI workflow is green. - Record the
commit SHA and the API/frontend image tags. - Confirm the EC2 instance
is running and reachable through Systems Manager.

On the EC2 instance:

```bash
cd /home/ubuntu/ecommerce-deployment
docker compose ps
```

The CI deployment updates the image tags in the deployment Compose file,
pulls the API and frontend images, recreates those services, and checks
their health endpoints.

## 2. Restart Services

Restart the application services:

```bash
cd /home/ubuntu/ecommerce-deployment
docker compose restart api frontend
```

Restart the complete Compose stack only when necessary:

```bash
docker compose restart
```

## 3. Check Status and Health

```bash
docker compose ps
curl -fsS http://localhost:3000/health
curl -fsS http://localhost:3000/ready
curl -fsS http://localhost:8080/health
curl -I http://localhost
```

Expected API health response:

```json
{ "status": "healthy", "service": "ecommerce-api" }
```

The readiness endpoint should report a connected database when
PostgreSQL is available.

## 4. Inspect Logs

```bash
docker compose logs --tail=100 api
docker compose logs --tail=100 frontend
docker compose logs --tail=100 db
docker compose logs -f api
```

For host Nginx:

```bash
sudo systemctl status nginx
sudo nginx -t
sudo tail -n 100 /var/log/nginx/error.log
sudo tail -n 100 /var/log/nginx/access.log
```

## 5. Incident Response: API or Frontend Unavailable

1.  Check `docker compose ps`.
2.  Check the affected service logs.
3.  Check API health and readiness.
4.  Check that PostgreSQL is healthy before restarting the API.
5.  Check host Nginx status and configuration.
6.  Restart only the affected service where possible.
7.  Re-run health checks and verify the application request path.

Useful commands:

```bash
docker compose ps
docker compose logs --tail=100 api frontend db
docker compose restart api
```

Record the observed failure, action taken, and recovery evidence for the
assessment demo.

## 6. Database Backup

The configured backup script is located at:

```bash
/home/ubuntu/ecommerce-backups/backup.sh
```

The scheduled job is configured for 02:00 UTC daily (07:30 IST). The
backup script uploads backups to the configured private S3 bucket.

Check the cron entry and backup files:

```bash
crontab -l
ls -lh /home/ubuntu/ecommerce-backups/
```

Check the S3 bucket using the AWS CLI and the EC2 instance role. Do not
make the bucket public.

## 7. Database Restore

A restore test to a temporary database has previously been completed
successfully. For a new restore:

1.  Identify the exact backup object and confirm it is the intended
    recovery point.
2.  Restore to a separate temporary database first.
3.  Verify the expected tables and record counts.
4.  Only plan production restoration after validating the backup and
    arranging an appropriate maintenance window.
5.  Preserve the current database volume/backup until the recovery has
    been verified.

Use the exact restore command and database credentials from the tested
backup procedure. Do not overwrite the production database as an
exploratory test.

## 8. Rollback

The repository includes a manually triggered GitHub Actions rollback
workflow. The existing workflow is known to roll back the API image.

1.  Identify the last known-good API image tag from the successful
    deployment history.
2.  Open GitHub Actions and run the rollback workflow with that tag.
3.  Review the workflow result and deployment logs.
4.  Verify API health and readiness.
5.  Verify the frontend and complete user request flow.

**Important:** Confirm whether the current rollback workflow also
restores the frontend image before relying on it for a full-stack
rollback. Do not claim full application rollback until this is tested.

## 9. Start and Stop the EC2 Instance

Stop the EC2 instance from the AWS Console when the environment is not
needed. Do not terminate it. EBS storage continues to incur charges
while the instance is stopped, and the public IPv4 address may change
after it is started again.

After starting the instance: - Confirm the instance is running. - Check
Systems Manager connectivity. - Check Docker services and health
endpoints. - Verify the current public IP and Nginx access.

## 10. Evidence to Retain

Keep the following evidence for the assessment: - Successful CI run URL
and commit SHA. - API and frontend image tags or digests. - Deployment
and health-check output. - Idempotency test output showing no duplicate
order or double stock deduction. - Failure and recovery demonstration. -
Backup object and successful restore-test evidence. - Rollback workflow
run and health verification.
