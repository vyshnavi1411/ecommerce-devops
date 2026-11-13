# Submission and Verification Checklist

Use this checklist against the Algions AI Labs assignment brief before
submitting.

## Repository and Documentation

-   [ ] Repository URL, primary branch, and final commit ID are correct.
-   [ ] README build/run/deploy instructions are tested from a clean
    environment.
-   [ ] Architecture diagram is included.
-   [ ] Operations runbook covers deploy, restart, logs, backup/restore,
    and incident response.
-   [ ] Port map and environment-variable instructions are accurate.
-   [ ] Rollback procedure is documented and tested.

## Required Demonstrations

-   [ ] Repeated checkout with the same idempotency key does not create
    duplicate orders or double-deduct stock.
-   [ ] A clean environment can build and start the service using
    documented steps.
-   [ ] CI runs formatting/lint/static checks, tests, and image build.
-   [ ] A versioned image tag or digest is recorded.
-   [ ] Health/readiness and application logs are demonstrated.
-   [ ] A service is deliberately stopped or broken, detection is shown,
    and recovery is demonstrated.
-   [ ] A database backup is restored or a rollback procedure is
    demonstrated with evidence.

## Evidence to Attach or Link

-   [ ] GitHub Actions pipeline run URL.
-   [ ] API and frontend image tag/digest.
-   [ ] Deployment URL or local deployment evidence.
-   [ ] Health-check and log output.
-   [ ] Backup/restore evidence.
-   [ ] API test output.
-   [ ] Architecture diagram.
-   [ ] 3--5 minute demo video.

## Items to Confirm in This Project

-   [ ] Verify and demonstrate the required order-status endpoint.
-   [ ] Verify HTTPS configuration; the documented host entry point
    currently uses HTTP.
-   [ ] Verify the rollback workflow restores every component required
    for the intended rollback; the existing workflow is known to roll
    back the API.
-   [ ] Verify current EC2 public IP after starting the instance.
-   [ ] Confirm repository contains no `.env`, passwords, access tokens,
    private keys, or real sensitive data.
-   [ ] Add AI-tool usage and source/library attribution in the
    submission form as requested by the assignment.
-   [ ] Confirm all links are accessible to reviewers.
