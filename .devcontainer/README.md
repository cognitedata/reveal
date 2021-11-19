# Devcontainer setup for Reveal

This devcontainer setup can be utilized in various ways to make it easier to get a development environment for Reveal.

One way is with Visual Studio Code - Remote containers, which will run installation of all Reveal pre-requisites, and allow development of it inside Docker on your machine.
You need to have Docker and VSCode installed on your machine.

1. Open VSCode
1. Press Ctrl+Shift-P (or the green "Remote window" in the lower left corner of VSCode)
1. Choose "Clone repository in container volume"
1. Choose "Clone a repository from Github in a Container volume"
1. Type "cognitedata/reveal"
1. Choose "master" branch (or any other branch)

A new VSCode window should now be opened, and it should start up the devcontainer. You can see the logs by clicking the notification dialog in the lower right.
Please see <https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers> for more instructions.

Once the devcontainer startup is done, open a new terminal, and follow the build steps as explained in the main README.md for Reveal, running yarn build steps.

If you have a (Github Codespaces]<https://github.com/features/codespaces> account, you should be able to load the devcontainer there as well.
