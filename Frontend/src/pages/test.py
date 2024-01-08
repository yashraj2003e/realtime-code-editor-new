from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service

options = Options()
options.binary_location = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
driver = webdriver.Chrome(
    options=options,
    service=Service(
        r"C:\\Users\\yashg\\OneDrive\\Desktop\\chromedriver-win64\\chromedriver-win64\\chromedriver.exe"
    ),
)
driver.get("https://www.goat.com/sneakers")
print("Chrome Browser Invoked")
# driver.quit()
