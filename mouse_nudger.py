from pynput.mouse import Controller
import time

mouse = Controller()

# how far to nudge the cursor each time
OFFSET = 1
# seconds between nudges
INTERVAL = 60

def nudge():
    x, y = mouse.position
    # tiny left-right nudge so it doesn't disturb you
    mouse.move(OFFSET, 0)
    time.sleep(0.5)
    mouse.move(-OFFSET, 0)

if __name__ == "__main__":
    try:
        print(f"Mouse nudger started. Nudging every {INTERVAL} seconds.")
        print("Press Ctrl+C to stop.")
        while True:
            nudge()
            time.sleep(INTERVAL - 0.5)
    except KeyboardInterrupt:
        print("\nMouse nudger stopped.")
        pass