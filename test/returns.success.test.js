import { Builder, By, until } from "selenium-webdriver";
import 'dotenv/config';

(async function testReturnsWithLogin() {
  const driver = await new Builder().forBrowser("chrome").build();

  try {
    console.log("Opening login page...");

    // 1. Go to login page
    await driver.get("http://localhost:5173/userlogin");


    // 3. Enter credentials (USE A TEST ACCOUNT)
    await driver.findElement(By.xpath("/html/body/div/main/div/form/div[1]/div/input")).sendKeys(process.env.TEST_EMAIL);
    await driver.findElement(By.xpath("/html/body/div/main/div/form/div[2]/div/input")).sendKeys(process.env.TEST_PASSWORD);

    // 4. Submit login
    await driver.findElement(By.css("button[type='submit']")).click();

    // 5. Wait for login to complete (adjust this!)
    await driver.sleep(3000);

    console.log("Logged in, going to returns page...");

    // 6. Go to returns page
    await driver.get("http://localhost:5173/returns");

    // 7. Wait for form
    await driver.wait(
      until.elementLocated(By.name("generatorModel")),
      10000
    );

    // 8. Fill form
    await driver.findElement(By.name("generatorModel")).sendKeys("Test Model");
    await driver.findElement(By.name("serialNumber")).sendKeys("12345");
    await driver.findElement(By.name("condition")).sendKeys("Damaged");
    await driver.findElement(By.name("reason")).sendKeys("Testing return");

    // 9. Submit
    await driver.findElement(By.css("button[type='submit']")).click();

    // 10. Check success message
    const message = await driver.wait(
      until.elementLocated(By.css("[data-testid='response-message']")),
      5000
    );

    const text = await message.getText();

    if (text.toLowerCase().includes("submitted")) {
      console.log("TEST PASSED:", text);
    } else {
      console.log("Unexpected message:", text);
    }

  } catch (err) {
    console.error("TEST FAILED:", err);
  } finally {
    await driver.quit();
  }
})();