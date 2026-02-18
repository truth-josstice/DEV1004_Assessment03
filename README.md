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

- **Action performed:**
- **Use in workflows:**
- **Benefits for pipeline:**

### 1.1.3 `test-frontend`

- **Action performed:**
- **Use in workflows:**
- **Benefits for pipeline:**

### 1.1.4 `build-push-docker-images`

- **Action performed:**
- **Use in workflows:**
- **Benefits for pipeline:**

### 1.1.5 `get-version-tag`

- **Action performed:**
- **Use in workflows:**
- **Benefits for pipeline:**

---

## 1.2 Custom Workflows

### 1.2.1 PR - Code Quality

### 1.2.2 PR - Test Suites

### 1.2.3 Main - Build and Push Images

### 1.2.4 CD - Deploy to Production

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