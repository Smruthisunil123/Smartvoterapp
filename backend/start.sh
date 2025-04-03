#!/bin/bash
echo "Setting NODE_PATH to: /home/user/smartvotingss/backend/node_modules"
NODE_PATH=/home/user/smartvotingss/backend/node_modules
echo "Current working directory: $(pwd)"
echo "Environment variables:"
env | grep -E "^(NODE_|^PATH=)"
echo "Attempting to start server with: env NODE_PATH=\"$NODE_PATH\" node /home/user/smartvotingss/backend/backend/server.js"
env NODE_PATH="$NODE_PATH" node /home/user/smartvotingss/backend/backend/server.js

