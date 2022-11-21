/**
 * This file is not used - config-overrides.json file takes care of the correct entry points to the app.
 * This file exists only for react-app-rewired to not complain and to serve as a documentation.
 * 
 * Charts reside in Fusion and in its own Charts domain, and while majority of the codebase is shared
 * between those two, there are some major differences that make it necessary to split some files.
 * One of the files that needed to be split was the index.tsx file, which is why there are two of them:
 * - `index-fusion.tsx` - for Charts in Fusion,
 * - `index-legacy.tsx` - for Legacy Charts.
 * 
 * There are two start scripts, depending on the target domain for Charts: 
 * - `yarn start:legacy`
 * - `yarn start:fusion`
 * Using a specific start script injects an env variable REACT_APP_DOMAIN to the codebase.
 * It is then retrieved in config-overrides, where react-app-rewired uses it to decide which index
 * file to use.
 * 
 * There are also two build scripts, which are used in Jenkinsfile to build and deploy correct
 * version of Charts to their respective domains.
 */

export { };
