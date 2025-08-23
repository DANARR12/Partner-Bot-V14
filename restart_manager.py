#!/usr/bin/env python3
"""
Discord Kurdish AI Bot - Python Restart Manager
Cross-platform auto-restart system with logging and monitoring
"""

import os
import sys
import time
import signal
import subprocess
import json
import logging
from datetime import datetime, timedelta
from pathlib import Path
import argparse

class BotRestartManager:
    def __init__(self, script_name="main.py", max_restarts=50, restart_delay=5, log_file="restart_manager.log"):
        self.script_name = script_name
        self.max_restarts = max_restarts
        self.restart_delay = restart_delay
        self.log_file = log_file
        self.restart_count = 0
        self.start_time = datetime.now()
        self.stats_file = "restart_stats.json"
        self.running = True
        
        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s | %(levelname)s | %(message)s',
            handlers=[
                logging.FileHandler(log_file),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(__name__)
        
        # Setup signal handlers
        signal.signal(signal.SIGINT, self._signal_handler)
        signal.signal(signal.SIGTERM, self._signal_handler)
    
    def _signal_handler(self, signum, frame):
        """Handle interrupt signals gracefully"""
        self.logger.info(f"🛑 Received signal {signum}. Shutting down restart manager...")
        self.running = False
    
    def _save_stats(self):
        """Save restart statistics to file"""
        stats = {
            "total_restarts": self.restart_count,
            "start_time": self.start_time.isoformat(),
            "last_restart": datetime.now().isoformat(),
            "uptime_seconds": (datetime.now() - self.start_time).total_seconds(),
            "script_name": self.script_name
        }
        
        try:
            with open(self.stats_file, 'w') as f:
                json.dump(stats, f, indent=2)
        except Exception as e:
            self.logger.warning(f"Failed to save stats: {e}")
    
    def _load_stats(self):
        """Load previous restart statistics"""
        try:
            if Path(self.stats_file).exists():
                with open(self.stats_file, 'r') as f:
                    return json.load(f)
        except Exception as e:
            self.logger.warning(f"Failed to load stats: {e}")
        return {}
    
    def _check_script_exists(self):
        """Check if the script to run exists"""
        if not Path(self.script_name).exists():
            self.logger.error(f"❌ Script '{self.script_name}' not found!")
            return False
        return True
    
    def _run_bot(self):
        """Run the bot script and return exit code"""
        try:
            self.logger.info(f"🚀 Starting bot (Attempt #{self.restart_count + 1})")
            
            # Start the bot process
            process = subprocess.Popen(
                [sys.executable, self.script_name],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                text=True,
                bufsize=1,
                universal_newlines=True
            )
            
            # Monitor the process
            try:
                exit_code = process.wait()
                return exit_code, process.stdout, process.stderr
            except KeyboardInterrupt:
                self.logger.info("🛑 Terminating bot process...")
                process.terminate()
                try:
                    process.wait(timeout=10)
                except subprocess.TimeoutExpired:
                    self.logger.warning("⚠️ Force killing bot process...")
                    process.kill()
                return -1, "", "Interrupted by user"
                
        except Exception as e:
            self.logger.error(f"💥 Failed to start bot: {e}")
            return -1, "", str(e)
    
    def _should_restart(self, exit_code):
        """Determine if the bot should be restarted based on exit code"""
        if exit_code == 0:
            self.logger.info("✅ Bot exited gracefully (Exit Code: 0)")
            return False
        elif exit_code == -1:
            self.logger.info("🛑 Bot was interrupted by user")
            return False
        else:
            self.logger.warning(f"❌ Bot crashed with exit code: {exit_code}")
            return True
    
    def _print_banner(self):
        """Print startup banner"""
        print("🤖 Discord Kurdish AI Bot - Restart Manager")
        print("=" * 50)
        print(f"📄 Script: {self.script_name}")
        print(f"🔄 Max Restarts: {self.max_restarts}")
        print(f"⏱️ Restart Delay: {self.restart_delay}s")
        print(f"📝 Log File: {self.log_file}")
        print(f"⏰ Started: {self.start_time.strftime('%Y-%m-%d %H:%M:%S')}")
        print("⏹️  Press Ctrl+C to stop")
        print()
    
    def _print_stats(self):
        """Print final statistics"""
        total_runtime = datetime.now() - self.start_time
        
        print("\n📊 Final Statistics:")
        print(f"   Total Restarts: {self.restart_count}")
        print(f"   Total Runtime: {total_runtime}")
        print(f"   Average Uptime: {total_runtime / max(1, self.restart_count + 1)}")
        print(f"   Log File: {self.log_file}")
        print(f"   Stats File: {self.stats_file}")
    
    def run(self):
        """Main restart loop"""
        self._print_banner()
        
        # Check if script exists
        if not self._check_script_exists():
            return 1
        
        # Load previous stats
        prev_stats = self._load_stats()
        if prev_stats:
            self.logger.info(f"📈 Previous session: {prev_stats.get('total_restarts', 0)} restarts")
        
        try:
            while self.running and self.restart_count < self.max_restarts:
                # Run the bot
                exit_code, stdout, stderr = self._run_bot()
                
                # Log output if there are errors
                if stderr and stderr.strip():
                    self.logger.error(f"Bot stderr: {stderr.strip()}")
                
                # Check if we should restart
                if not self._should_restart(exit_code):
                    self.logger.info("🛑 Stopping restart manager due to graceful exit")
                    break
                
                self.restart_count += 1
                self._save_stats()
                
                # Check if we've hit the restart limit
                if self.restart_count >= self.max_restarts:
                    self.logger.error(f"🛑 Maximum restart limit ({self.max_restarts}) reached!")
                    break
                
                # Wait before restarting
                if self.running:
                    self.logger.info(f"⏳ Waiting {self.restart_delay} seconds before restart...")
                    for i in range(self.restart_delay):
                        if not self.running:
                            break
                        time.sleep(1)
        
        except KeyboardInterrupt:
            self.logger.info("🛑 Received keyboard interrupt")
        except Exception as e:
            self.logger.error(f"💥 Unexpected error in restart manager: {e}")
        
        finally:
            self._save_stats()
            self._print_stats()
            self.logger.info("👋 Restart manager exiting...")
        
        return 0

def main():
    """Main entry point with argument parsing"""
    parser = argparse.ArgumentParser(description="Discord Bot Restart Manager")
    parser.add_argument("--script", default="main.py", help="Python script to run (default: main.py)")
    parser.add_argument("--max-restarts", type=int, default=50, help="Maximum number of restarts (default: 50)")
    parser.add_argument("--delay", type=int, default=5, help="Delay between restarts in seconds (default: 5)")
    parser.add_argument("--log-file", default="restart_manager.log", help="Log file path (default: restart_manager.log)")
    parser.add_argument("--test", action="store_true", help="Run simple bot test instead")
    
    args = parser.parse_args()
    
    # Use simple bot test if requested
    if args.test:
        args.script = "simple_bot_test.py"
        print("🧪 Running in test mode with simple_bot_test.py")
    
    # Create restart manager
    manager = BotRestartManager(
        script_name=args.script,
        max_restarts=args.max_restarts,
        restart_delay=args.delay,
        log_file=args.log_file
    )
    
    # Run the manager
    return manager.run()

if __name__ == "__main__":
    sys.exit(main())