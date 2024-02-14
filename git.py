import pyautogui
import time

path = "C:/Users/anojm/Downloads/thasmai.2"
commitmessage = input("Enter your commit message")


pyautogui.press("win")

pyautogui.write("cmd")

pyautogui.press("enter")



time.sleep(2)

pyautogui.write(f"cd {path}")
pyautogui.press("enter")
pyautogui.write("git add .")
time.sleep(1)

pyautogui.press("enter")

pyautogui.write(f"git commit -m {commitmessage}")
time.sleep(1)

pyautogui.press("enter")

pyautogui.write("git push origin main")
time.sleep(1)

pyautogui.press("enter")
