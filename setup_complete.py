#!/usr/bin/env python3
"""
Discord Kurdish AI Bot - Complete Setup Script
Handles installation of all dependencies across different operating systems
"""

import os
import sys
import subprocess
import platform
import shutil
from pathlib import Path

def run_command(cmd, check=True, shell=False):
    """Run a command and return the result"""
    try:
        if isinstance(cmd, str) and not shell:
            cmd = cmd.split()
        result = subprocess.run(cmd, capture_output=True, text=True, check=check, shell=shell)
        return result.returncode == 0, result.stdout, result.stderr
    except subprocess.CalledProcessError as e:
        return False, e.stdout, e.stderr
    except Exception as e:
        return False, "", str(e)

def check_python_version():
    """Check if Python version is 3.8+"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Python 3.8+ is required. Current version:", f"{version.major}.{version.minor}.{version.micro}")
        return False
    print(f"✅ Python {version.major}.{version.minor}.{version.micro} detected")
    return True

def detect_os():
    """Detect the operating system"""
    system = platform.system().lower()
    if system == "darwin":
        return "macos"
    elif system == "linux":
        return "linux"
    elif system == "windows":
        return "windows"
    else:
        return "unknown"

def check_ffmpeg():
    """Check if FFmpeg is installed"""
    success, stdout, stderr = run_command("ffmpeg -version")
    if success:
        version_line = stdout.split('\n')[0] if stdout else "Unknown version"
        print(f"✅ FFmpeg is installed: {version_line}")
        return True
    else:
        print("❌ FFmpeg is not installed")
        return False

def install_ffmpeg():
    """Install FFmpeg based on the operating system"""
    os_type = detect_os()
    print(f"🔧 Installing FFmpeg for {os_type}...")
    
    if os_type == "linux":
        # Try different package managers
        if shutil.which("apt"):
            success, _, _ = run_command("sudo apt update")
            if success:
                success, _, _ = run_command("sudo apt install -y ffmpeg")
                return success
        elif shutil.which("yum"):
            success, _, _ = run_command("sudo yum install -y ffmpeg")
            return success
        elif shutil.which("dnf"):
            success, _, _ = run_command("sudo dnf install -y ffmpeg")
            return success
        elif shutil.which("pacman"):
            success, _, _ = run_command("sudo pacman -S --noconfirm ffmpeg")
            return success
    
    elif os_type == "macos":
        if shutil.which("brew"):
            success, _, _ = run_command("brew install ffmpeg")
            return success
        else:
            print("❌ Homebrew not found. Please install Homebrew first:")
            print("   /bin/bash -c \"$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)\"")
            return False
    
    elif os_type == "windows":
        print("❌ Automatic FFmpeg installation on Windows is not supported.")
        print("   Please download FFmpeg from: https://ffmpeg.org/download.html")
        print("   And add it to your PATH environment variable.")
        return False
    
    print(f"❌ Unsupported operating system: {os_type}")
    return False

def install_python_dependencies():
    """Install Python dependencies"""
    print("📦 Installing Python dependencies...")
    
    # Check if pip is available
    if not shutil.which("pip") and not shutil.which("pip3"):
        print("❌ pip is not installed. Please install pip first.")
        return False
    
    pip_cmd = "pip3" if shutil.which("pip3") else "pip"
    
    # Install dependencies
    success, stdout, stderr = run_command(f"{pip_cmd} install -r requirements.txt")
    if success:
        print("✅ Python dependencies installed successfully")
        return True
    else:
        print("❌ Failed to install Python dependencies")
        print("Error:", stderr)
        return False

def create_env_file():
    """Create .env file if it doesn't exist"""
    env_file = Path(".env")
    if env_file.exists():
        print("✅ .env file already exists")
        return True
    
    if Path(".env.example").exists():
        print("📝 Creating .env file from .env.example...")
        shutil.copy(".env.example", ".env")
        print("✅ .env file created. Please edit it with your actual values:")
        print("   - DISCORD_BOT_TOKEN")
        print("   - OPENAI_API_KEY")
        print("   - CURSOR_ENABLED (optional)")
        print("   - CURSOR_API_KEY or CURSOR_SESSION_TOKEN (optional)")
        return True
    else:
        print("❌ .env.example file not found")
        return False

def create_directories():
    """Create necessary directories"""
    directories = ["downloads", "logs"]
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created directory: {directory}")

def test_bot_imports():
    """Test if the bot can import all required modules"""
    print("🧪 Testing bot imports...")
    try:
        import discord
        import aiosqlite
        import openai
        import httpx
        import aiofiles
        import pydantic
        print("✅ All required modules can be imported")
        return True
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False

def main():
    """Main setup function"""
    print("🤖 Discord Kurdish AI Bot - Complete Setup")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Detect OS
    os_type = detect_os()
    print(f"🖥️  Operating System: {os_type}")
    
    # Check and install FFmpeg
    if not check_ffmpeg():
        if input("📥 Do you want to install FFmpeg automatically? (y/n): ").lower().startswith('y'):
            if not install_ffmpeg():
                print("❌ FFmpeg installation failed. Please install it manually.")
                sys.exit(1)
            else:
                # Verify installation
                if not check_ffmpeg():
                    print("❌ FFmpeg installation verification failed.")
                    sys.exit(1)
        else:
            print("⚠️  Skipping FFmpeg installation. Voice features may not work.")
    
    # Install Python dependencies
    if not install_python_dependencies():
        sys.exit(1)
    
    # Test imports
    if not test_bot_imports():
        print("❌ Module import test failed. Please check your Python environment.")
        sys.exit(1)
    
    # Create .env file
    if not create_env_file():
        print("❌ Failed to create .env file. Please create it manually.")
        sys.exit(1)
    
    # Create directories
    create_directories()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("1. Edit the .env file with your actual API keys")
    print("2. Configure your Discord bot permissions")
    print("3. Run the bot with: python main.py")
    print("4. Or use auto-restart: python restart_manager.py")
    
    print("\n🔧 Optional Cursor Agent Setup:")
    print("- Set CURSOR_ENABLED=true in .env")
    print("- Add your CURSOR_API_KEY or CURSOR_SESSION_TOKEN")
    
    print("\n✨ Your Discord Kurdish AI Bot with Cursor Agent integration is ready!")

if __name__ == "__main__":
    main()