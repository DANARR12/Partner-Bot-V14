from PIL import Image
import pytesseract

# point to tesseract binary if needed:
# pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

img = Image.open("profile_card.png")
text = pytesseract.image_to_string(img)
print(text)