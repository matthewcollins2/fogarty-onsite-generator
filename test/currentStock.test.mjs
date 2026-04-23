import { Builder, By, until } from "selenium-webdriver";
import dotenv from "dotenv"
import path from "path";
import { verify } from "crypto";
import { text } from "stream/consumers";

dotenv.config();

//node test/currentStock.test.mjs
async function runTest() {
   const driver = await new Builder().forBrowser("chrome").build();
   await driver.manage().window().maximize();
 
   const id = process.env.TEST_EMAIL;
   const password = process.env.TEST_PASSWORD;
 
   const textSerial = "serialTextTest";
   const textGen = "genTextTest";
   const textPart = "partTextTest";
   const textDescription = "descTextTest";
   const stock = 2;
 
   const imagePath = path.resolve("test", "assets", "test-image.png");
   const imageURL = "https://picsum.photos/seed/picsum/200/300"
 
 
   if (!id || !password) {
     throw new Error("Missing TEST_EMAIL or TEST_PASSWORD in .env");
   }
 
   const WAIT = 15000;

  
async function login() {
    await driver.get("http://localhost:5173");

    const signInBtn = await driver.wait(
      until.elementLocated(By.css('a[href="/userlogin"]')),
      WAIT
    );
    await driver.wait(until.elementIsVisible(signInBtn), WAIT);
    await signInBtn.click();

    const emailEl = await driver.wait(
      until.elementLocated(By.css('input[type="email"]')),
      WAIT
    );
    await driver.wait(until.elementIsVisible(emailEl), WAIT);
    await emailEl.clear();
    await emailEl.sendKeys(id);

    const passEl = await driver.wait(
      until.elementLocated(By.css('input[type="password"]')),
      WAIT
    );
    await driver.wait(until.elementIsVisible(passEl), WAIT);
    await passEl.clear();
    await passEl.sendKeys(password);

    const loginBtn = await driver.wait(
      until.elementLocated(By.css('button[type="submit"]')),
      WAIT
    );
    await driver.wait(until.elementIsEnabled(loginBtn), WAIT);
    await loginBtn.click();

    await driver.sleep(1500);
  }

  async function goToAdminDashboard(){
    const adminDashboardBtn = await driver.wait(
        until.elementLocated(By.css('a[href="/admin/dashboard"]')),
        WAIT                      
    );
    await driver.wait(until.elementIsEnabled(adminDashboardBtn),WAIT);
    await adminDashboardBtn.click();
  }

  async function goToInventoryManagement() {
    const inventoryBtn = await driver.wait(
      until.elementLocated(By.xpath('//*[@id="root"]/div/div[1]/div[2]/div/p[4]')),
      WAIT
    );
    await driver.wait(until.elementIsVisible(inventoryBtn), WAIT);
    await inventoryBtn.click();
  }

async function createGeneratorItem() {

    console.log("----- Creating Testing Generator Item -----");
    const createBtn = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/div[2]/div/div/div[2]/div/div[3]/button[1]")),
      WAIT                      
    );
    await driver.wait(until.elementIsVisible(createBtn), WAIT);
    await createBtn.click();

    const serialTxt = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/form/input[1]")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(serialTxt), WAIT);
    await serialTxt.clear();
    await serialTxt.sendKeys(textSerial);

    const genTxt = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/form/input[2]")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(genTxt), WAIT);
    await genTxt.clear();
    await genTxt.sendKeys(textGen);

    const descText = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/form/input[3]")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(descText), WAIT);
    await descText.clear();
    await descText.sendKeys(textDescription);

    const textStock = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/form/input[4]")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(textStock), WAIT);
    await textStock.clear();
    await textStock.sendKeys(stock);

   const fileInput = await driver.findElement(
    By.xpath("/html/body/div/div/form/div[2]/input[2]")
    );
    await fileInput.sendKeys(imagePath);

    const urlInput = await driver.findElement(
    By.xpath("/html/body/div/div/form/div[3]/input[1]")
    );
    await urlInput.clear();
    await urlInput.sendKeys(imageURL);

   const addGen = await driver.wait(
    until.elementLocated(By.css("button[type='submit']")),
    WAIT
    );
    await driver.wait(until.elementIsVisible(addGen), WAIT);
    await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", addGen);
    await driver.sleep(500);
    await driver.executeScript("arguments[0].click();", addGen);
}
async function flipToParts() {
    const flipBtn = await driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div/div[2]/div/div/div[1]/div/div/div/button[2]')),
      WAIT
    );
    await driver.wait(until.elementIsVisible(flipBtn), WAIT);
    await flipBtn.click();

    await driver.wait(
      until.elementLocated(By.css('button[field="Part_Name"]')),
      WAIT
    );
    console.log("Switched to parts tab");
    await driver.sleep(1000);
  }
  async function createPartItem(){
  
    console.log("----- Creating Testing Part Item -----");
      await driver.sleep(1000);
  
      const createBtn = await driver.wait(
        until.elementLocated(By.css('button[aria-label="add-part"]')),
        WAIT
      );
      await driver.executeScript("arguments[0].click();", createBtn);
  
      const PartTxt = await driver.wait(
        until.elementLocated(By.xpath("/html/body/div/div/form/input[1]")),
        WAIT                            
      );
      await driver.wait(until.elementIsVisible(PartTxt), WAIT);
      await PartTxt.clear();
      await PartTxt.sendKeys(textPart);
  
      const descText = await driver.wait(
        until.elementLocated(By.xpath("/html/body/div/div/form/input[2]")),
        WAIT
      );
      await driver.wait(until.elementIsVisible(descText), WAIT);
      await descText.clear();
      await descText.sendKeys(textDescription);
  
      const textStock = await driver.wait(
        until.elementLocated(By.xpath("/html/body/div/div/form/input[3]")),
        WAIT
      );
      await driver.wait(until.elementIsVisible(textStock), WAIT);
      await textStock.clear();
      await textStock.sendKeys(stock);
  
      const fileInputs = await driver.findElements(By.xpath("/html/body/div/div/form/div[2]/input[2]"));
      await fileInputs[0].sendKeys(imagePath);            
  
      const fileInputs2 = await driver.findElements(By.xpath("/html/body/div/div/form/div[3]/input[1]"));
      await fileInputs2[0].sendKeys(imageURL);
      
       const addPart = await driver.wait(
        until.elementLocated(By.css("button[type='submit']")),
        WAIT
        );
        await driver.wait(until.elementIsVisible(addPart), WAIT);
        await driver.executeScript("arguments[0].scrollIntoView({ block: 'center' });", addPart);
        await driver.sleep(500);
        await driver.executeScript("arguments[0].click();", addPart);
    }

  async function goToCurrentStock() {
       await driver.get("http://localhost:5173/CurrentStockPage");
    }

  async function searchForItem(text) {
    const searchInput = await driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div[1]/div[1]/div[1]/div/input')),
      WAIT
    );
    await driver.wait(until.elementIsVisible(searchInput), WAIT);
    await searchInput.clear();
    await searchInput.sendKeys(text);
  }

  async function verifyItemInStock(text) {
    const itemResults = await driver.findElements(
      By.xpath(`//*[contains(text(), '${text}')]`)
    );

    if (itemResults.length > 0) {
      console.log("PASS: item appears in current stock");
    } else {
      console.log("FAIL: item was not populated in current stock");
    }
  }

  async function verifyDetailInStock(textName, textDesc) {
  
    const itemName = await driver.wait(
      until.elementLocated(By.xpath(`//p[normalize-space()='${textName}']`)),
      WAIT
    );

    await driver.wait(until.elementIsVisible(itemName), WAIT);
    await itemName.click();

    const descriptionEl = await driver.wait(
    until.elementLocated(By.xpath(`//p[normalize-space()='${textDescription}']`)),
    WAIT
  ).catch(() => null);

    if (!descriptionEl) {
      console.log("FAIL: description element was not found");
      return false;
    }

    const actualDescription = await descriptionEl.getText();

    if (actualDescription ===  textDesc) {
      console.log(`PASS: description is accurate -> "${actualDescription}"`);
      return true;
    } else {
      console.log(`FAIL: expected "${textDesc}" but got "${actualDescription}"`);
      return false;
    }
  }
  async function deleteGeneratorItem(itemNameText) {
    console.log("----- Deleting Testing Generator Item -----");

    const checkMarkBtn = await driver.wait(
      until.elementLocated(
        By.xpath(
          `//div[@role='gridcell' and @data-field='name' and normalize-space()='${itemNameText}']/ancestor::*[@role='row'][1]//input[@aria-label='Select row']`
        )
      ),
      WAIT
    );

    await driver.executeScript("arguments[0].click();", checkMarkBtn);

    const deleteBtn = await driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div/div[2]/div/div/div[2]/div/div[3]/button[2]')),
      WAIT
    );
    await driver.wait(until.elementIsVisible(deleteBtn), WAIT);
    await deleteBtn.click();
    
    const confirmBtn = await driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div/div[2]/div/div/div[2]/div/div[2]/div/div/button[2]')),
      WAIT
    );
    await driver.wait(until.elementIsVisible(confirmBtn), WAIT);
    await confirmBtn.click();

    // wait a moment for delete to finish
    await driver.sleep(1000);
  }

  async function deletePartItem(itemNameText) {
    console.log("----- Deleting Testing Part Item -----");
    const checkMarkBtn = await driver.wait(
      until.elementLocated(
        By.xpath(
          `//div[@role='gridcell' and normalize-space()='${itemNameText}']/ancestor::*[@role='row'][1]//input[@aria-label='Select row']`
        )
      ),
      WAIT
    );

    await driver.executeScript("arguments[0].click();", checkMarkBtn);

    const deleteBtn = await driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div/div[2]/div/div/div[3]/div/div[3]/button')),
      WAIT                          
    );
    await driver.wait(until.elementIsVisible(deleteBtn), WAIT);
    await deleteBtn.click();
    
    const confirmBtn = await driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div/div[2]/div/div/div[3]/div/div[2]/div/div/button[2]')),
      WAIT
    );
    await driver.wait(until.elementIsVisible(confirmBtn), WAIT);
    await confirmBtn.click();

    // wait a moment for delete to finish
    await driver.sleep(1000);
}

try {
    await login();
   
    await driver.get("http://localhost:5173")

    await goToAdminDashboard();

    await goToInventoryManagement();

    await createGeneratorItem();

    await driver.sleep(1000);

    await flipToParts();
    
    await driver.sleep(1000);

    await createPartItem();

    await driver.sleep(1000);

    await goToCurrentStock();

    await driver.sleep(1000);

    await searchForItem(textGen);

    await verifyItemInStock(textGen);

    await verifyDetailInStock(textGen, textDescription);

    await goToCurrentStock();

    await driver.sleep(1000);

    await searchForItem(textPart);

    await verifyItemInStock(textPart);

    await verifyDetailInStock(textPart, textDescription);

    await driver.get("http://localhost:5173")

    await goToAdminDashboard();

    await goToInventoryManagement();

    await deleteGeneratorItem(textGen);

    await driver.sleep(1000);
    
    await flipToParts();

    await driver.sleep(1000);

    await deletePartItem(textPart);


  } catch (err) {
    console.error("Error in currentStock:", err);
  } finally {
    //await driver.quit();
  }
}

runTest();
