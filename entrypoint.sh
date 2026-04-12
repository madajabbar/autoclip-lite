#!/bin/sh

# Start the background worker in the background
echo "🚀 Starting AutoClip Background Worker..."
# We use npx tsx to run the worker in production environment
# Or use node if already compiled, but since we copy src, tsx is easier for 'Lite' version
npx tsx src/services/worker.ts &

# Start the Next.js server
echo "🌐 Starting Next.js Web Server..."
npm start
