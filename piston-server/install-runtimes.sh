#!/bin/bash
# Install required languages for Piston

echo "Installing Python..."
docker exec -it piston_api cli/index.js ppman install python 3.10.0

echo "Installing JavaScript (Node.js)..."
docker exec -it piston_api cli/index.js ppman install nodejs 18.15.0

echo "Done! Installed languages:"
docker exec -it piston_api cli/index.js ppman list
