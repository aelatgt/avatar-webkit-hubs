![GitHub Workflow Status](https://img.shields.io/github/workflow/status/aelatgt/avatar-webkit-hubs/Build%20and%20Deploy) [![download](https://shields.io/badge/script-room.js-blue)](https://www.aelatgt.org/avatar-webkit-hubs/room.js)

# Setup

Configure environment variables before any NVM configuration:

```bash
# .bashrc
export AVATAR_WEBKIT_REPO_SECRET="..."
export AVATAR_WEBKIT_AUTH_TOKEN="..."
```

Copy `ngrok.template.yml` into `ngrok.yml` and fill in your Ngrok auth token and subdomain.

# Development

```bash
yarn
yarn dev
```

# Build Artifacts

This project builds two files:

- `room.js` contains the Hubs room script
- `room.css` contains styles for the custom UI, loaded by the room script
