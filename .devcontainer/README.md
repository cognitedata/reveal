# Devcontainer for Fusion

This devcontainer allow you to develop Fusion using VSCode, in a container.

## Set up dev container

You can run the dev container remotely on Github CodeSpaces (option A), or locally in Docker Desktop or Podman (option B).

Prerequisite: When using VSCode locally, make sure you are logged in to your Cognite Github account in VSCode. Check this in the profile icon in the lower left of the VSCode menu.

### A. Github Codespaces

This is the option where the devcontainer runs in the cloud, and you connect to it from your local VSCode installation, or from a browser.

To change the default setting for whether to open VSCode in the browser or in your host OS, go to settings in your github profile, and search for "codespaces", scroll to the Editor preference section. There you can change the default setting for opening codespaces. I.e. at https://github.com/settings/codespaces.

Click this link to open this repository in a codespace:

[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/cognitedata/fusion?quickstart=1)

Or from the github web UI, in the fusion repo URL, https://github.com/cognitedata/fusion, select the `master` (or other) branch and click on the green button on the right. Choose the `Codespaces` pane and then the `+` sign (or ... to change the default configurations for the new instance). The instance should have at last 4 cores (and with 16 GB RAM, 32 GB disk).

All Cognite engineers should have access to Github Codespaces.
But if you do not have access to Github Codespaces, reach out on the #topic-github-codespaces channel on Slack.

The first time you open the devcontainer, it will take a while to build the container image. Subsequent starts will be faster.

Alternatively to clicking the link above, in a new (empty) local VSCode window start the devcontainer from the command palette (Ctrl+Shift+P) with `Codespaces: Create new codespace` and select the cognitedata/fusion repository. Select branch, and instance type.

You can check for existing codespaces in your github profile settings, under "Codespaces", at https://github.com/codespaces.

### B. Local Docker desktop / Podman

This option is to run the development environment fully locally, with VSCode running locally on your host OS, and the Fusion code cloned and running in a container in your local docker instance.

To run this devcontainer in Docker locally, you need to have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

Another alternative is to use [Podman](https://podman.io/).

Make sure docker or podman is running.

You also need to have the `Remote - Containers` extension installed in your local VSCode installation. This is included in the `Remote Development` extension pack, which is recommended, and should be installed by default in an up-to-date VSCode installation.

Note: For best performance (especially on Windows with WSL2), you should clone the fusion repository inside a docker volume. In the VSCode palette (Ctrl+Shift+P), search for "clone repo", which should show "Dev Containers: Clone Repository in Named Container Volume". Select that.

![VSCode command palette -> Dev Containers: Clone Repository in Named Container Volume](devcontainers-clone-repo-image.png)

Click through the clone repo steps in the command palette, and search for the `cognitedata/fusion` repository in the repository search step. Name the container volume for the cloned repository something sensible. Then let the devcontainer initialize and start.

## After devcontainer has started

To be able to run yarn, you need to log in to the Cognite npm organization.
Open a terminal in the VSCode session (Ctrl+Shift+`), and run:

> npm login

The npm login command will show a link to a web page where you can log in with your Cognite account. Click the link, and allow VSCode to open it in your host OS browser. After logging in (preferably with 2FA), you can close the browser tab and return to the terminal in VSCode. When runnning VSCode in a non-UI environment, such as in Codespaces, do not press enter to have npm login command try open the link in the local browser. Alternatively, you can copy the link and open it in a browser manually.

You can then follow the [main Fusion repository README.md](https://github.com/cognitedata/fusion#readme) to build and run Fusion apps, using `yarn` and `nx` commands.

Note that the `nx` component and `gh` (github cli) are already installed in the devcontainer, so you can skip any advice to install them.
