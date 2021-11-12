# Platypus CLI

Our aim is to make it easier for application developer to develop app by reducing cost, friction and learning curve for them. Codename Platypus will help us achieve the same.

# Install

```
npm install -g @cognite/platypus-cli
```

# Login

You can obtain your personal `client_secret` by visiting `Azure > App registrations` and then go to certificate and secrets and generate your new `client_secret`.

```
platypus login --client-secret=<your-client-secret>
```

# Commands

```
platypus templates list
platypus templates create --name=some name --description=some description
platypus templates delete --id=templateGroupId
```
