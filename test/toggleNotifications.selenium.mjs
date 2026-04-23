import { Builder, By, until, Capabilities } from "selenium-webdriver";

//simple testing.
//how to run the test:
// 1. in terminal 'npm install selenium-webdriver'
// 2, create test file and save it under tests.
// 3. in the terminal, run the test with 'node test/login.selenium.mjs' , replace after / with the name of your test file.

//  How to find the elements to interact with in the code:
//  CAN inspect website via F12
//  Right click on what to click -> inscpect
//  Right click on the highlighted code in the inspector -> copy -> copy selector (for css selector) or copy xpath (for xpath)
//  Need to use 'driver.wait' to wait for the elements to be located before interacting with them, otherwise it may throw an error if the element is not yet present in the DOM.

async function testLogin() {
    const caps = Capabilities.chrome();
    caps.set("chromeOptions", {
        args: [
            "--headless",
            "--no-sandbox",
            "--disable-dev-shm-usage",
            "--disable-save-password-bubble",
            "--disable-password-manager",
            "--disable-password-manager-reauthentication",
        ],
    });
    const driver = await new Builder().withCapabilities(caps).build(); //specific browser to use, 
    const id = "cordonpgm@gmail.com";       //test email and id      
    const password = "PASSword12!@";

    const WAIT = 10000; //ms, how long to wait for the element to be located before throwing an error.

    const runs = 10;
    const times = [];
    let failures = 0;
  
    try {   
        for (let i = 1; i <= runs; i++) {
        const t0 = performance.now();

        try {
            // launch the application
            await driver.get("http://localhost:5173");

            const signInBtn = await driver.wait(
            until.elementLocated(By.xpath('//*[@id="root"]/header/div/div/div[2]/a')),
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
            until.elementLocated(By.xpath('//*[@id="root"]/main/div/form/button')),
            WAIT
            );
            await driver.wait(until.elementIsEnabled(loginBtn), WAIT);
            await loginBtn.click();

            await driver.sleep(5000) // wait for login to process and dashboard to load

            // Handle potential pop-ups (e.g., "Save Password" or "Welcome" dialogs)
            try {
                const pwDialog = await driver.wait(
                    until.elementLocated(By.css("div[role='dialog'], button#dismiss")),
                    2000
                );
                await pwDialog.click(); // or find the “OK”/“Dismiss” button
            } catch (e) {
            // not present, continue
            }

            const settingsBtn = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/header/div/div/div[2]/div/div/a')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(settingsBtn), WAIT);
            await settingsBtn.click();

            await driver.sleep(1000); // wait for settings page to load

            await driver.wait(until.elementLocated(By.css('input[type="checkbox"]')), WAIT);
            let checkboxes = await driver.findElements(By.css('input[type="checkbox"]'));
            await checkboxes[0].click(); // Receive Texts
            checkboxes = await driver.findElements(By.css('input[type="checkbox"]'));
            await checkboxes[1].click(); // Receive Emails
            checkboxes = await driver.findElements(By.css('input[type="checkbox"]'));
            await checkboxes[0].click(); // Toggle back
            checkboxes = await driver.findElements(By.css('input[type="checkbox"]'));
            await checkboxes[1].click(); // Toggle back

            await driver.sleep(1000); // wait for 1 second to ensure the toggles are processed before signing out.

            const homeBtn = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/header/div/div/div[1]/a[1]')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(homeBtn), WAIT);
            await homeBtn.click();

            const signOutBtn = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/header/div/div/div[2]/div/button')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(signOutBtn), WAIT);
            await signOutBtn.click();

            await driver.sleep(3000); // wait for 3 second before closing the browser, to ensure all actions are completed.

            /*
            const headerBtn = await driver.wait(
            until.elementLocated(By.xpath('//*[@id="root"]/header/div/div/button')),
            WAIT
            );
            await driver.wait(until.elementIsVisible(headerBtn), WAIT);
            // if you want to click it, keep this:
            await headerBtn.click();
            */

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

testLogin();