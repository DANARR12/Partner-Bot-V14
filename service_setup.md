# Mouse Nudger Service Setup

## Installation Instructions

1. **Copy the service file to systemd directory:**
   ```bash
   sudo cp mouse-nudger.service /etc/systemd/system/
   ```

2. **Reload systemd to recognize the new service:**
   ```bash
   sudo systemctl daemon-reload
   ```

3. **Enable the service to start on boot:**
   ```bash
   sudo systemctl enable mouse-nudger.service
   ```

4. **Start the service immediately:**
   ```bash
   sudo systemctl start mouse-nudger.service
   ```

## Service Management Commands

- **Check service status:**
  ```bash
  sudo systemctl status mouse-nudger.service
  ```

- **Stop the service:**
  ```bash
  sudo systemctl stop mouse-nudger.service
  ```

- **Restart the service:**
  ```bash
  sudo systemctl restart mouse-nudger.service
  ```

- **Disable service from starting on boot:**
  ```bash
  sudo systemctl disable mouse-nudger.service
  ```

- **View service logs:**
  ```bash
  sudo journalctl -u mouse-nudger.service -f
  ```

## Service Configuration

- **User:** ubuntu
- **Working Directory:** /workspace
- **Script Location:** /workspace/mouse_nudger.py
- **Auto-restart:** Yes (every 5 seconds if it fails)
- **Start on boot:** Yes (when enabled)

## Notes

- The service will automatically restart if the script crashes
- Logs are stored in the system journal
- The service runs under the 'ubuntu' user account
- Make sure the Python script has execute permissions if needed