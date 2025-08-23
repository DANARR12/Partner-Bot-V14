#!/bin/bash

echo "🔧 Installing FFmpeg for Discord Voice Support..."
echo "📋 Note: This is Linux, not macOS (brew won't work here)"
echo ""

# Check if FFmpeg is already installed
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg is already installed!"
    ffmpeg -version | head -1
    echo ""
    echo "🎤 Your Discord Kurdish AI Bot voice features should work!"
    exit 0
fi

echo "📥 Installing FFmpeg using apt (Linux package manager)..."

# Update package list
echo "🔄 Updating package list..."
sudo apt update

# Install FFmpeg
echo "📦 Installing FFmpeg..."
sudo apt install -y ffmpeg

# Verify installation
if command -v ffmpeg &> /dev/null; then
    echo ""
    echo "✅ FFmpeg installed successfully!"
    echo "📋 Version:"
    ffmpeg -version | head -1
    echo ""
    echo "🎤 Voice features for your Discord Kurdish AI Bot are now ready!"
    echo ""
    echo "🚀 You can now use:"
    echo "   - !talk <message> - AI chat with voice response"
    echo "   - /speak <text> - Text-to-speech"
    echo "   - Voice message transcription"
    echo "   - 🔊 Speak buttons in chat responses"
else
    echo "❌ FFmpeg installation failed!"
    echo "💡 Try manually: sudo apt update && sudo apt install ffmpeg -y"
fi