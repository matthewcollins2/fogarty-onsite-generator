import { Builder, By, until } from "selenium-webdriver";
import dotenv from "dotenv"
import path from "path";

dotenv.config();

//node test/testingInventory.mjs
async function testInventory() {
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

    const fileInputs = await driver.findElements(By.xpath("/html/body/div/div/form/div[2]/input[2]"));
    await fileInputs[0].sendKeys(imagePath);

    const fileInputs2 = await driver.findElements(By.xpath("/html/body/div/div/form/div[3]/input[1]"));
    await fileInputs2[0].sendKeys(imageURL);
    
    const addGen = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/form/div[5]/button")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(addGen), WAIT);
    await addGen.click();
  }
  async function waitForImageToLoad(imgElement, timeout = 15000) {
  await driver.wait(async () => {
    return await driver.executeScript(
      "return arguments[0].complete && arguments[0].naturalWidth > 0;",
      imgElement
    );
  }, timeout);
}

  async function verifyGeneratorItemInitial(){
    console.log("-----Verifying Generator Initial Item Set-Up-----")
    // 1st image: uploaded file
    const firstImg = await driver.wait(
      until.elementLocated(By.xpath(" /html/body/div/div/div[2]/div/div/div[2]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div[1]/div[7]/div/img")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(firstImg), WAIT);
    await waitForImageToLoad(firstImg, 20000);

    const firstSrc = await firstImg.getAttribute("src");
    console.log("First image src:", firstSrc);

    if (!firstSrc.includes("test-image.png")) {
      throw new Error(`Expected first image to contain test-image.png, got: ${firstSrc}`);
    }

    const firstLoaded = await driver.executeScript(
      "return arguments[0].complete && arguments[0].naturalWidth > 0;",
      firstImg
    );
    if (!firstLoaded) {
      throw new Error("First image exists but did not load correctly.");
    }

    // 2nd image: pasted URL
    const secondImg = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/div[2]/div/div/div[2]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div[1]/div[8]/div/img")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(secondImg), WAIT);
    await waitForImageToLoad(secondImg, 20000);

    const secondSrc = await secondImg.getAttribute("src");
    console.log("Second image src:", secondSrc);

    if (secondSrc !== imageURL) {
      throw new Error(`Expected second image to be ${imageURL}, got: ${secondSrc}`);
    }

    const secondLoaded = await driver.executeScript(
      "return arguments[0].complete && arguments[0].naturalWidth > 0;",
      secondImg
    );
    if (!secondLoaded) {
      throw new Error("Second image exists but did not load correctly.");
    }

    // 3rd image: noImage
    const thirdImg = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/div[2]/div/div/div[2]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div[1]/div[9]/div/img")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(thirdImg), WAIT);

    const thirdSrc = await thirdImg.getAttribute("src");
    console.log("Third image src:", thirdSrc);

    if (thirdSrc !== null && thirdSrc !== "") {
      throw new Error(`Expected third image to have no src, got: ${thirdSrc}`);
    }

    console.log("Third image correctly has no src.");

    console.log("All three images verified successfully.");
  }

  async function editGeneratorItem(){
    // click edit pictures button
    const editBtn = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/div[2]/div/div/div[2]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div[1]/div[10]/button")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(editBtn), WAIT);
    await editBtn.click();

    // clear first image slot
    const clearBtn = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div[2]/div[3]/div/div[1]/div/div[1]/button")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(clearBtn), WAIT);
    await clearBtn.click();

    // upload image for second slot
    const fileInput2 = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div[2]/div[3]/div/div[1]/div/div[2]/label/input")),
      WAIT
    );
    await fileInput2.sendKeys(imagePath);

    // paste URL for third slot
    const urlInput3 = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div[2]/div[3]/div/div[1]/div/div[3]/div/div/input")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(urlInput3), WAIT);
    await urlInput3.clear();
    await urlInput3.sendKeys(imageURL);

    // save
    const saveBtn = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div[2]/div[3]/div/div[2]/button[2]")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(saveBtn), WAIT);
    await saveBtn.click();
  }

  async function verifyGeneratorItemChange(){
    console.log("-----Verifying Generator Editing Set-Up-----")
     // 1st image: no image
    const firstImg = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/div[2]/div/div/div[2]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div[1]/div[7]/div/img")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(firstImg), WAIT);

    const firstSrc = await firstImg.getAttribute("src");
    console.log("First image src:", firstSrc);

    if (firstSrc !== null && firstSrc !== "") {
      throw new Error(`Expected first image to have no src, got: ${firstSrc}`);
    }
    console.log("First image correctly has no src.");

    // 2nd image: uploaded file
    const secondImg = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/div[2]/div/div/div[2]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div[1]/div[8]/div/img")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(secondImg), WAIT);
    await waitForImageToLoad(secondImg, 20000);

    const secondSrc = await secondImg.getAttribute("src");
    console.log("Second image src:", secondSrc);

    if (!secondSrc.includes("test-image.png")) {
      throw new Error(`Expected second image to be test-image.png, got: ${secondSrc}`);
    }

    const secondLoaded = await driver.executeScript(
      "return arguments[0].complete && arguments[0].naturalWidth > 0;",
      secondImg
    );
    if (!secondLoaded) {
      throw new Error("Second image exists but did not load correctly.");
    }
    // 3rd image: url
     const thirdImg = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/div[2]/div/div/div[2]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div[1]/div[9]/div/img")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(thirdImg), WAIT);
    await waitForImageToLoad(thirdImg, 20000);

    const thirdSrc = await thirdImg.getAttribute("src");
    console.log("Third image src:", thirdSrc);

    if (thirdSrc !== imageURL) {
      throw new Error(`Expected second image to be ${imageURL}, got: ${thirdSrc}`);
    }

    const thirdLoaded = await driver.executeScript(
      "return arguments[0].complete && arguments[0].naturalWidth > 0;",
      thirdImg
    );
    if (!thirdLoaded) {
      throw new Error("Third image exists but did not load correctly.");
    }

    console.log("All three images verified successfully.");
  }

  async function deleteGenItem() {
    console.log("-----Deleting Testing Generator Item-----")
    const checkMarkBtn = await driver.wait(
      until.elementLocated(By.css('input[aria-label="Select row"]')),
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

    await driver.sleep(1000);

    const createBtn = await driver.wait(
      until.elementLocated(By.css('button[aria-label="add-part"]')),
      WAIT
    );
    await driver.executeScript("arguments[0].click();", createBtn);

    console.log("Current URL after add click:", await driver.getCurrentUrl());
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
      until.elementLocated(By.xpath("/html/body/div/div/form/div[5]/button")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(addPart), WAIT);
    await addPart.click();
  
  }
  async function verifyPartItemInitial(){
    console.log("-----Verifying Part Initial Set-Up-----")
    // 1st image: uploaded file
    const firstImg = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/div[2]/div/div/div[3]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div/div[6]/div/img")),
      WAIT                          
    );                        
    await driver.wait(until.elementIsVisible(firstImg), WAIT);
    await waitForImageToLoad(firstImg, 20000);

    const firstSrc = await firstImg.getAttribute("src");
    console.log("First image src:", firstSrc);

    if (!firstSrc.includes("test-image.png")) {
      throw new Error(`Expected first image to contain test-image.png, got: ${firstSrc}`);
    }

    const firstLoaded = await driver.executeScript(
      "return arguments[0].complete && arguments[0].naturalWidth > 0;",
      firstImg
    );
    if (!firstLoaded) {
      throw new Error("First image exists but did not load correctly.");
    }

    // 2nd image: pasted URL
    const secondImg = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/div[2]/div/div/div[3]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div/div[7]/div/img")),
      WAIT                          
    );
    await driver.wait(until.elementIsVisible(secondImg), WAIT);
    await waitForImageToLoad(secondImg, 20000);

    const secondSrc = await secondImg.getAttribute("src");
    console.log("Second image src:", secondSrc);

    if (secondSrc !== imageURL) {
      throw new Error(`Expected second image to be ${imageURL}, got: ${secondSrc}`);
    }

    const secondLoaded = await driver.executeScript(
      "return arguments[0].complete && arguments[0].naturalWidth > 0;",
      secondImg
    );
    if (!secondLoaded) {
      throw new Error("Second image exists but did not load correctly.");
    }

    // 3rd image: noImage
    const thirdImg = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/div[2]/div/div/div[3]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div/div[8]/div/img")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(thirdImg), WAIT);

    const thirdSrc = await thirdImg.getAttribute("src");
    console.log("Third image src:", thirdSrc);

    if (thirdSrc !== null && thirdSrc !== "") {
      throw new Error(`Expected third image to have no src, got: ${thirdSrc}`);
    }

    console.log("Third image correctly has no src.");

    console.log("All three images verified successfully.");
  }
  async function editPartItem(){
    // click edit pictures button
    const editBtn = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div/div/div[2]/div/div/div[3]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div/div[9]/button")),
      WAIT                            
    );
    await driver.wait(until.elementIsVisible(editBtn), WAIT);
    await editBtn.click();

    // clear first image slot
    const clearBtn = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div[2]/div[3]/div/div[1]/div/div[1]/button")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(clearBtn), WAIT);
    await clearBtn.click();

    // upload image for second slot
    const fileInput2 = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div[2]/div[3]/div/div[1]/div/div[2]/label/input")),
      WAIT
    );
    await fileInput2.sendKeys(imagePath);

    // paste URL for third slot
    const urlInput3 = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div[2]/div[3]/div/div[1]/div/div[3]/div/div/input")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(urlInput3), WAIT);
    await urlInput3.clear();
    await urlInput3.sendKeys(imageURL);

    // save
    const saveBtn = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div[2]/div[3]/div/div[2]/button[2]")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(saveBtn), WAIT);
    await saveBtn.click();
  }
  async function verifyPartItemChange(){
    console.log("-----Verifying Part Editing Set-Up-----")
      // 1st image: no image
      const firstImg = await driver.wait(
        until.elementLocated(By.xpath("/html/body/div/div/div[2]/div/div/div[3]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div/div[6]/div/img")),
        WAIT                           
      );
      await driver.wait(until.elementIsVisible(firstImg), WAIT);

      const firstSrc = await firstImg.getAttribute("src");
      console.log("First image src:", firstSrc);

      if (firstSrc !== null && firstSrc !== "") {
        throw new Error(`Expected first image to have no src, got: ${firstSrc}`);
      }
      console.log("First image correctly has no src.");

      // 2nd image: uploaded file
      const secondImg = await driver.wait(
        until.elementLocated(By.xpath("/html/body/div/div/div[2]/div/div/div[3]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div/div[7]/div/img")),
        WAIT
      );
      await driver.wait(until.elementIsVisible(secondImg), WAIT);
      await waitForImageToLoad(secondImg, 20000);

      const secondSrc = await secondImg.getAttribute("src");
      console.log("Second image src:", secondSrc);

      if (!secondSrc.includes("test-image.png")) {
        throw new Error(`Expected second image to be test-image.png, got: ${secondSrc}`);
      }

      const secondLoaded = await driver.executeScript(
        "return arguments[0].complete && arguments[0].naturalWidth > 0;",
        secondImg
      );
      if (!secondLoaded) {
        throw new Error("Second image exists but did not load correctly.");
      }
      // 3rd image: url
      const thirdImg = await driver.wait(
        until.elementLocated(By.xpath("/html/body/div/div/div[2]/div/div/div[3]/div/div[1]/div/div/div[1]/div[2]/div[2]/div/div/div[8]/div/img")),
        WAIT
      );
      await driver.wait(until.elementIsVisible(thirdImg), WAIT);
      await waitForImageToLoad(thirdImg, 20000);

      const thirdSrc = await thirdImg.getAttribute("src");
      console.log("Third image src:", thirdSrc);

      if (thirdSrc !== imageURL) {
        throw new Error(`Expected second image to be ${imageURL}, got: ${thirdSrc}`);
      }

      const thirdLoaded = await driver.executeScript(
        "return arguments[0].complete && arguments[0].naturalWidth > 0;",
        thirdImg
      );
      if (!thirdLoaded) {
        throw new Error("Third image exists but did not load correctly.");
      }

      console.log("All three images verified successfully.");
    }

  async function deletePartItem() {
    console.log("-----Deleting Testing Part Item-----")
      const checkMarkBtn = await driver.wait(
        until.elementLocated(By.css('input[aria-label="Select row"]')),
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

    await verifyGeneratorItemInitial();

    await editGeneratorItem();

    await driver.sleep(1000);

    await verifyGeneratorItemChange();

    await deleteGenItem();
    
    
    await flipToParts();

    console.log("waited now trying to create part");

    await createPartItem();

    await flipToParts();

    await verifyPartItemInitial();

    await editPartItem();

    await driver.sleep(2000);

    await verifyPartItemChange();
    
  
    await deletePartItem();
    console.log("Finished InventoryTesting")

  } catch (err) {
    console.error("Error in testInventory:", err);
  } finally {
    await driver.quit();
  }
}

testInventory();