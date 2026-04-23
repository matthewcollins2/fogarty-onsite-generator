import { Builder, By, until } from 'selenium-webdriver';

async function requestQuote() {

    let driver = await new Builder().forBrowser('chrome').build();
    const WAIT = 10000; //ms, how long to wait for the element to be located before throwing an error.
    const runs = 1;
    const times = [];
    let failures = 0;
    const genModel = "B4567";
    const serialNum = "67676767";
    const description = "quote request new";
    const id = "testtest@example.com";       //test email and id      
    const password = "passsssswrd";  //test password
  
    try {
        // launch the application
        await driver.get("http://localhost:5173");

        // login section
        const signInBtn = await driver.wait(
        until.elementLocated(By.xpath('//*[@id="root"]/header/div/div/div[2]/a')),
        WAIT
        );
        await driver.wait(until.elementIsVisible(signInBtn), WAIT);
        await signInBtn.click();

        const emailEl = await driver.wait(
        until.elementLocated(By.css('input[type="Email"]')),
        WAIT
        );
        await driver.wait(until.elementIsVisible(emailEl), WAIT);
        await emailEl.clear();
        await emailEl.sendKeys(id);

        const passEl = await driver.wait(
        until.elementLocated(By.css('input[type="Password"]')),
        WAIT
        );
        await driver.wait(until.elementIsVisible(passEl), WAIT);
        await passEl.clear();
        await passEl.sendKeys(password);

        const loginBtn = await driver.wait(
        until.elementLocated(By.xpath('//*[@id="root"]/main/div/form/button')),
        WAIT
        );
        await driver.wait(until.elementIsEnabled(loginBtn), WAIT);
        await loginBtn.click();

        // loop only the quote request section
        for (let i = 1; i <= runs; i++) {
        const t0 = performance.now();

        try {

            const quoteBtn = await driver.wait(
                    until.elementLocated(By.xpath('//a[contains(.,"Quote")] | //button[contains(.,"Quote")]')),
                    WAIT
                );

                // force click (React-safe)
                await driver.executeScript("arguments[0].scrollIntoView(true);", quoteBtn);
                await driver.executeScript("arguments[0].click();", quoteBtn);

            // quote request section
            // --- GENERATOR MODEL ---
// --- GENERATOR MODEL ---
const genModelEl = await driver.wait(
    until.elementLocated(By.css('input[placeholder="Generator Model"]')),
    WAIT
);
await genModelEl.clear();
await genModelEl.sendKeys(genModel);

// --- SERIAL NUMBER ---
const serialEl = await driver.wait(
    until.elementLocated(By.css('input[placeholder="Generator Serial Number"]')),
    WAIT
);
await serialEl.clear();
await serialEl.sendKeys(serialNum);

// --- ADDITIONAL INFO ---
const descriptionEl = await driver.wait(
    until.elementLocated(By.css('textarea[placeholder="Additional Information"]')),
    WAIT
);
await descriptionEl.clear();
await descriptionEl.sendKeys(description);

            const submitBtn = await driver.wait(
    until.elementLocated(By.xpath('//button[contains(.,"Submit Quote Request")]')),
    WAIT
);

await driver.executeScript("arguments[0].scrollIntoView(true);", submitBtn);
await driver.executeScript("arguments[0].click();", submitBtn);

            await driver.sleep(10000); // wait 10 seconds for email to send

            

            const t1 = performance.now();
            const ms = t1 - t0;
            times.push(ms);
            console.log(`Run ${i}/${runs}: ${ms.toFixed(1)} ms`);

        } catch (e) {
            failures++;
            console.log(`Run ${i}/${runs}: FAIL -> ${e.message}`);
            }
        }
            
    } finally {
    await driver.quit();
    }

    if (times.length) {
        const sum = times.reduce((a, b) => a + b, 0);
        const avg = sum / times.length;
        const min = Math.min(...times);
        const max = Math.max(...times);

        console.log("\n=== RESULTS ===");
        console.log(`Runs: ${runs}`);
        console.log(`Success: ${times.length}`);
        console.log(`Failures: ${failures}`);
        console.log(`Avg: ${avg.toFixed(1)} ms`);
        console.log(`Min: ${min.toFixed(1)} ms`);
        console.log(`Max: ${max.toFixed(1)} ms`);
    }

}

requestQuote();