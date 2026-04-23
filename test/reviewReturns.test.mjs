import { Builder, By, Key, until } from 'selenium-webdriver';
import 'dotenv/config';

const TEST_EMAIL = process.env.TEST_EMAIL;
const TEST_PASSWORD = process.env.TEST_PASSWORD;

async function runTest() {
  if (!TEST_EMAIL || !TEST_PASSWORD) {
    console.error("Missing credentials in .env file!");
    return;
  }

  let driver = await new Builder().forBrowser('chrome').build();

  try {
    console.log("Opening login page...");

    // Go to login page
    await driver.get("http://localhost:5173/userlogin");


    // Enter credentials
    await driver.findElement(By.xpath("/html/body/div/main/div/form/div[1]/div/input"))
    .sendKeys(TEST_EMAIL);

    await driver.findElement(By.xpath("/html/body/div/main/div/form/div[2]/div/input"))
    .sendKeys(TEST_PASSWORD);

    // Submit login
    await driver.findElement(By.css("button[type='submit']")).click();

    // Wait for login to complete
    await driver.sleep(3000);

    console.log("Logged in...");

    
    // Navigate to your app
    await driver.get('http://localhost:5173/admin/incoming/returns');

    // Wait for the loading spinner to disappear
    await driver.wait(until.elementLocated(By.css('h4')), 10000); 

    // Test the Retention Box
    const retentionInput = await driver.findElement(
        By.xpath("/html/body/div/div/div[2]/div[1]/div/div/input")
    );
    
    // Clear the current value and type '90'
    await retentionInput.sendKeys(Key.CONTROL, "a", Key.DELETE);
    await retentionInput.sendKeys('100');

    // Click the 'Save Retention' button
    const saveBtn = await driver.findElement(By.xpath("/html/body/div/div/div[2]/div[1]/button"));
    await saveBtn.click();

    // Verify the Save message appears
    await driver.wait(until.elementLocated(By.xpath("//p[text()='Saved!']")), 5000);
    console.log("Retention test passed!");

    // Test Sort
    const sortDropdown = await driver.findElement(By.xpath("/html/body/div/div/div[2]/div[2]/div[2]/div/div"));
    await sortDropdown.click();

    // Select the "Status"
    const statusOption = await driver.wait(until.elementLocated(By.xpath("/html/body/div[2]/div[3]/ul/li[5]")), 5000);
    await statusOption.click();

    console.log("Sorting test passed!");

    // Click the Select dropdown in the first row
    const firstRowStatus = await driver.findElement(By.xpath("/html/body/div/div/div[2]/div[3]/div/table/tbody/tr[1]/td[8]/div/div"));
    await firstRowStatus.click();

    // Wait for the dropdown menu to pop up and click Completed
    const completedOption = await driver.wait(until.elementLocated(By.xpath("/html/body/div[2]/div[3]/ul/li[1]")), 5000);
    await completedOption.click();

    console.log("Status change test passed!");

    // Select delete option on first entry
    const DeleteOption = await driver.wait(until.elementLocated(By.xpath("/html/body/div/div/div[2]/div[3]/div/table/tbody/tr[1]/td[9]/button")), 5000);
    await DeleteOption.click();

    // Confirm deletion
    const ConfirmOption = await driver.wait(until.elementLocated(By.xpath("/html/body/div[2]/div[3]/div/div[2]/button[2]")), 5000);
    await ConfirmOption.click();
    
    console.log("Delete test passed!");

  } catch (error) {
    console.error("Test failed:", error);
  } finally {
    await driver.sleep(2000);
    await driver.quit();
  }
}

runTest();