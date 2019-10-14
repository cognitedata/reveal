# Developing on Visual Studio

1. Install Visual Studio 2019 with Node support
![Visual Studio installer with Node](https://docs.microsoft.com/en-us/visualstudio/ide/media/quickstart-nodejs-workload.png?view=vs-2019)
2. Install (NodeJS 10)[https://nodejs.org/en/]
3. Install (NpmTaskRunner)[https://github.com/madskristensen/NpmTaskRunner]
4. From the File-menu, select Open -> Folder and open the root of this project. 
5. Find `package.json` in the Solution Explorer, right click -> Npm -> Install Missing npm packages. This should install dependencies
6. IntelliSense and compiler errors should now be visible in the Visual Studio

# Building and running

The application is executed using NPM. From command line this can be done by first installing dependencies (if not already done):
	```bash
	npm install
	```
After dependencies are installed, a web server can be started:
	```bash
	npm run-script serve
	```
Visit http://localhost:8080/.

In Visual Studio, the web server can be started by right clicking `package.json` and selecting Npm -> npm run-script serve.

# Debugging using Chrome and Visual Studio

See https://www.lostindetails.com/articles/javascript-debugging-in-visualstudio-with-chrome.
