#!/bin/bash
# Install Chromium and dependencies for Puppeteer on Render

echo "Installing Chromium and dependencies..."

# Update package list
apt-get update

# Install Chromium and required dependencies
apt-get install -y \
  chromium-browser \
  chromium-codecs-ffmpeg \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  libgbm1 \
  libxshmfence1

echo "Chromium installation complete!"
