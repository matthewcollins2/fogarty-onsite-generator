import { Builder, By, until } from "selenium-webdriver";
import 'dotenv/config';

(async function testValidation() {
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

    await driver.wait(until.elementLocated(By.name("generatorModel")), 5000);

    // Leave required field empty
    await driver.findElement(By.name("reason")).sendKeys("Testing validation");

    // Submit
    await driver.findElement(By.css("button[type='submit']")).click();

    const input = await driver.findElement(By.name("generatorModel"));
    const validationMsg = await input.getAttribute("validationMessage");

    if (validationMsg) {
      console.log("VALIDATION WORKING:", validationMsg);
    } else {
      console.log("Validation failed");
    }

  } catch (err) {
    console.error("TEST FAILED:", err);
  } finally {
    await driver.quit();
  }
})();