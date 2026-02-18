# DEV1004 - Assessment 03: Develop a CI/CD Pipeline

## Table of Contents

- [The Pipeline](#1-the-pipeline-actions-and-workflows)
  - [Custom Actions](#11-custom-actions)
    - [setup-env](#111-setup-env)
    - [test-backend](#112-test-backend)
    - [test-frontend](#113-test-frontend)
    - [build-push-docker-images](#114-build-push-docker-images)
    - [get-version-tag](#115-get-version-tag)
  - [Custom Workflows](#12-custom-workflows)
    - [PR - Code Quality](#121-pr---code-quality)
    - [PR - Test Suits](#122-pr---test-suites)
    - [Main - Build and Push Images](#123-main---build-and-push-images)
    - [CD - Deploy to Production](#124-cd---deploy-to-production)
- [The Tech](#2-the-tech-cicd-systems)
  - [GitHub Actions](#21-github-actions)
  - [Docker](#22-docker)
  - [Docker Hub](#23-docker-hub)
  - [Google Cloud Run](#24-google-cloud-run)
  - [Firebase Hosting](#25-firebase-hosting)
  - [CLI's & SDKs](#26-cli-tools--sdks)
  - [Supporting Infrastructure Services](#27-supporting-infrastructure-services)

## 1. The Pipeline: Actions and Workflows

In developing a CI/CD pipeline, I focussed on finding the right tool for the job, and the right tool for my level of development. This meant finding free services, free hosting platforms, and using KISS and DRY principles while developing my workflows.

I created Custom Actions where code would be re-used across workflows, and I used existing actions to keep my workflow files clean. I deployed to two free cloud services, Google Cloud Run for my containerised backend, and Firebase Hosting for my static frontend. I focussed on keeping variables secure and injected only when required, ensuring the application deploys easily and consistently while still supporting local development - either via direct local runs, or Docker Compose for a containerized approach.

Here we will discuss the pipeline I created through custom actions and workflows.

---

## 1.1 Custom Actions

### 1.1.1 `setup-env`

- **Action performed:** Sets up the correct Node.js version for a specified directory (`./backend` or `./frontend`), and runs a clean install (`npm ci`) for deterministic builds.
- **Use in workflows:** Any workflow which needs to set up a Node.js environment uses this action, keeping the steps in workflows smaller and more readable. This action is used in `pr-test.yml`, `pr-quality.yml`, and `main-cd.yml`, as all require setting up Node.js environments.
- **Benefits for pipeline:** Abstracts Node.js setup logic in a re-usable component, replacing code duplication across multiple workflow files, and ensuring consistent setup.

### 1.1.2 `test-backend`

- **Action performed:** Uses GitHub Secrets injected as environment variables to run all tests for backend application, with coverage reports optionally triggered by manual workflow dispatch. Preserves all testing reports and uploads as a GitHub Artifact.
- **Use in workflows:** Used in `pr-test.yml` file, a full testing suite workflow for the application. This workflow is a status check which must pass before PRs are merged to the production branch.
- **Benefits for pipeline:** Abstracts the testing logic from the workflow file, and centralises testing to a single workflow. This creates a "all tests must pass" security feature for pushes to production branch along with GitHub Rulesets. Testing action can be re-used for any future workflow additions such as for staging environments as needed.

### 1.1.3 `test-frontend`

- **Action performed:** Runs all existing tests for the frontend application and preserves all test reports uploaded as a GitHub Artifact.
- **Use in workflows:** Used in `pr-test.yml` file, a full testing suite for the application. This workflow is a status check which must pass before PRs are merged to the production branch.
- **Benefits for pipeline:** Abstracts frontend test logic from the workflow file, ensuring consistent execution across the PR workflow. Separates frontend testing concerns while maintaining them as required status checks for production branch protection. Testing action can be re-used for any future workflow additions as above.

### 1.1.4 `build-push-docker-images`

- **Action performed:** Uses GitHub Secrets to inject dynamic variables. Using the `main` branch as a single source of truth, it rebuilds images when changes are made to codebase files while excluding documentation (.md), workflow (.yml) and docs folder changes that don't require image rebuilds. Applies semantic version tagging to ensure consistency across Github releases and Docker images, and supports manual workflow dispatch with optional manual version tagging for flexibility.
- **Use in workflows:** Used in `main-build-push.yml` file. Semantic version tags are generated in the workflow and applied to the action, version tags are uploaded as artifacts to be shared across other workflows in the pipeline.
- **Benefits for pipeline:** Abstracts the Docker image build and push logic from the workflow file, ensuring re-usability across the pipeline, and readability of workflow files. The action is setup for a single project, but adding a "image name" input would make this action mono-repo agnostic and re-usable across multiple similar projects.

### 1.1.5 `get-version-tag`

- **Action performed:** Downloads and parses version tag artifact from `main-build-push.yml` using the `workflow_run` ID, and outputs it for deployment versioning.
- **Use in workflows:** Used in `main-cd.yml` to retrieve and assign the most recent version tags for deployment. Does not overwrite internal version ID, but allows for visual version tracking.
- **Benefits for pipeline:** Consistency of version tagging across container registry (Docker Hub) and deployment platforms, providing clear traceability between builds and deployment.

---

## 1.2 Custom Workflows

### 1.2.1 PR - Code Quality

- **When workflow occurs:** Occurs when any PR to `main` branch is: opened, synchronized, re-opened or marked as ready-for-review.
- **Workflow performs:** Runs ESLint and Prettier checks, using associated config files for reference per directory. Performs a spell-check on all files except expected binary data (.png etc) with inline comments generated for clarity.
- **Placement in pipeline:** Runs in parallel with the `PR - Test Suites` workflow, and is a required status check protecting the `main` branch through GitHub Rulesets.
- **Example diagram:**

![A diagram explaining the flow of each step in the Code Quality workflow](./assets/images/code-quality-diagram.png)

### 1.2.2 PR - Test Suites

- **When workflow occurs:** Occurs when any PR to `main` branch is: opened, synchronized, re-opened or marked as ready-for-review. Can be manually dispatched with an optional coverage tag.
- **Workflow performs:** Executes full test suites on both backend (Jest) and frontend (Vitest) codebases. Backend tests can optionally generate a coverage report when manually dispatched with the `run-coverage` input. All test results are preserved via the `test-backend` and `test-frontend` custom actions.
- **Placement in pipeline:** Runs in parallel with `PR - Code Quality` workflow, and is a required status check protecting the `main` branch through GitHub Rulesets.
- **Example diagram:**

![A diagram explaining the flow of each step in the Testing workflow](./assets/images/test-diagram.png)

### 1.2.3 Main - Build and Push Images

- **When workflow occurs:** Triggered on push to `main` branch with explicit exceptions for documentation (.md), workflow (.yml) and docs folders changes to avoid unnecessary image rebuilds. Can be manually triggered with manual version tag overrides. Scheduled to run once per week (Sunday 2am) for security rebuilds of container base images.
- **Workflow performs:** Uses external action `anothrNick/github-tag-action` to generate semantic version tags. Tags are applied in workflow to GitHub Repo tag and passed to subsequent steps. Uses the `build-push-docker-images` custom action to build and push images to Docker Hub. Saves version tags per workflow as `version.txt` to be accessed by `main-cd` workflow.
- **Placement in pipeline:** Executes after PRs are merged to `main`, must complete successfully before the `main-cd` deployment workflow runs. Ensures Docker Hub images stay consistent with GitHub code and that the most recent version is available for deployment.
- **Example diagram:**

![A diagram explaining the flow of each step in the Build and Push Images workflow](./assets/images/build-push-diagram.png)

### 1.2.4 CD - Deploy to Production

- **When workflow occurs:** Occurs on completed `workflow_run` of `main-build-push` workflow. Exits early if `main-build-push` is not successful.
- **Workflow performs:**
  - **CD - Deployment Version Tag:** Uses `get-version-tag` custom action to download and parse `version.txt` artifact created from `main-build-push` workflow.
  - **Deploy Production Backend:**
    - Installs `gcloud` SDK to communicate with Google Cloud Run via CLI commands.
    - Authenticates to GCP using GitHub Secrets variables injected during workflow.
    - Uses Docker Hub version matching `tag` output from `get-version-tag` custom action to deploy latest backend image, with three retries to protect against transient failures.
    - Outputs Cloud Run revision history in `json` and `txt` formats and uploads as artifacts.
  - **Verify Backend Deployment:**
    - Waits 10 seconds to ensure backend deployment has time to spin up, uses `curl` to send get request to deployed backend URL.
  - **Deploy Production Frontend:**
    - Uses custom action `setup-env` to setup Node.js in frontend environment.
    - Uses Vite to build static `dist` folder for deployment.
    - Installs `firebase-tools` globally to CI environment.
    - Uses Firebase CLI to deploy from `dist` folder.
  - **Verify Frontend Deployment:**
    - Waits 10 seconds to ensure frontend deployment has time to spin up, uses `curl` to send request to deployed frontend URL.
  - **Deployment Summary:**
    - Saves deployment version, Cloud Run revision ID, and timestamp of deployment, uploads as artifact for persistent history.
    - Summarises entire workflow as `GITHUB_STEP_SUMMARY`
- **Placement in pipeline:** Final stage of CI/CD pipeline, running automatically after successful testing and code quality checks in PRs, and after successful completion of the `main-build-push` workflow. Deploys verified images to production, completing the delivery cycle from commit to deployment.
- **Example screenshot:**

![A screenshot of each step in succession from the GitHub Actions console](./assets/images/main-cd-screenshot.png)

---

## 2. The Tech: CI/CD Systems

### 2.1 GitHub Actions

- What does it do
- Why it was chosen
- How it's integrated
- Key features used

### 2.2 Docker

### 2.3 Docker Hub

### 2.4 Google Cloud Run

### 2.5 Firebase Hosting

### 2.6 CLI Tools & SDKs

### 2.7 Supporting Infrastructure Services
