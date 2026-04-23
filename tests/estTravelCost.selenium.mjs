// estTravelCost.selenium.js
import selenium from 'selenium-webdriver';
const { Builder, By, until } = selenium;

async function estTravelCost() {

    let driver = await new Builder().forBrowser('chrome').build();
    const WAIT = 15000;

    const genModel = "GM1234";
    const serialNum = "97678767";
    const description = "Generator won't start";
    const id = "ktestest@gmail.com";
    const password = "Testpass";

    try {
        await driver.get("http://localhost:5173");

        // ---------------- LOGIN ----------------
        const signInBtn = await driver.wait(
            until.elementLocated(By.xpath('//*[@id="root"]/header/div/div/div[2]/a')),
            WAIT
        );
        await driver.executeScript("arguments[0].click();", signInBtn);

        const emailEl = await driver.wait(
            until.elementLocated(By.css('input[type="Email"]')),
            WAIT
        );
        await emailEl.sendKeys(id);

        const passEl = await driver.wait(
            until.elementLocated(By.css('input[type="Password"]')),
            WAIT
        );
        await passEl.sendKeys(password);

        const loginBtn = await driver.wait(
            until.elementLocated(By.xpath('//*[@id="root"]/main/div/form/button')),
            WAIT
        );
        await driver.executeScript("arguments[0].click();", loginBtn);

        await driver.sleep(3000);

        // ---------------- BOOK APPOINTMENT ----------------
        const appointBtn = await driver.wait(
            until.elementLocated(By.xpath('//a[contains(.,"Appointment")] | //button[contains(.,"Appointment")]')),
            WAIT
        );
        await driver.executeScript("arguments[0].click();", appointBtn);

        const genModelEl = await driver.wait(
            until.elementLocated(By.xpath('//label[contains(.,"Generator Model")]/following::input[1]')),
            WAIT
        );
        await genModelEl.sendKeys(genModel);

        const serialEl = await driver.wait(
            until.elementLocated(By.xpath('//label[contains(.,"Serial Number")]/following::input[1]')),
            WAIT
        );
        await serialEl.sendKeys(serialNum);

        const descriptionEl = await driver.wait(
            until.elementLocated(By.xpath('//textarea')),
            WAIT
        );
        await descriptionEl.sendKeys(description);

        const dateInput = await driver.findElement(By.css('input[type="date"]'));
        await dateInput.sendKeys("2026-03-25");

        const timeSlot = await driver.wait(
            until.elementLocated(By.xpath('//button[contains(.,"AM") or contains(.,"PM")]')),
            WAIT
        );
        await driver.executeScript("arguments[0].click();", timeSlot);

        const submitBtn = await driver.findElement(
            By.xpath('//button[contains(.,"Submit")]')
        );
        await driver.executeScript("arguments[0].click();", submitBtn);

        console.log("✅ Appointment created");

        await driver.sleep(4000);

        // ---------------- SETTINGS ----------------
        const settingsBtn = await driver.wait(
            until.elementLocated(By.xpath('//*[contains(text(),"Settings")]')),
            WAIT
        );
        await driver.executeScript("arguments[0].click();", settingsBtn);

        console.log("📍 Settings opened");

        await driver.sleep(3000);

        console.log("🎉 DONE");

    } catch (e) {
        console.log("❌ ERROR:", e.message);
    } finally {
        await driver.quit();
    }
}

// ✅ FIXED CALL (THIS WAS YOUR ISSUE)
estTravelCost();
