#!/bin/bash

echo "🚀 Setting up Local VPN Bridge Server..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Create bridge directory if it doesn't exist
mkdir -p bridge-server
cd bridge-server

# Copy files
cp ../local-bridge-server.js ./
cp ../package-local-bridge.json ./package.json

echo "📦 Installing dependencies..."
npm install

echo ""
echo "🎉 Local VPN Bridge Server setup complete!"
echo ""
echo "📋 To start the bridge server:"
echo "   cd bridge-server"
echo "   npm start"
echo ""
echo "🔗 The bridge will run on http://localhost:3001"
echo "🌐 Your Vercel app will automatically detect and use it"
echo ""
echo "⚠️  Important:"
echo "   1. Make sure your VPN is connected before starting the bridge"
echo "   2. Keep the bridge server running while using the Vercel app"
echo "   3. The bridge allows your Vercel app to use your local VPN connection"
echo ""