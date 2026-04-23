import selenium from 'selenium-webdriver';
const { Builder, By, until } = selenium;

async function requestAppointment() {

    let driver = await new Builder().forBrowser('chrome').build();
    const WAIT = 15000;
    const runs = 5;
    const times = [];
    let failures = 0;

    const genModel = "GM1234";
    const serialNum = "97678767";
    const description = "Generator won't start";
    const id = "testtest@example.com";
    const password = "passsssswrd";

    try {
        // --- OPEN APP ---
        await driver.get("http://localhost:5173");

        // --- LOGIN ---
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
        await emailEl.clear();
        await emailEl.sendKeys(id);

        const passEl = await driver.wait(
            until.elementLocated(By.css('input[type="Password"]')),
            WAIT
        );
        await passEl.clear();
        await passEl.sendKeys(password);

        const loginBtn = await driver.wait(
        until.elementLocated(By.xpath('//*[@id="root"]/main/div/form/button')),
        WAIT
        );
        await driver.wait(until.elementIsEnabled(loginBtn), WAIT);
        await loginBtn.click();

        // wait after login
        await driver.sleep(3000);

        // --- LOOP APPOINTMENTS ---
        for (let i = 1; i <= runs; i++) {
            const t0 = performance.now();

            try {
                // 🔥 FIXED: Find Appointment button by text
                const appointBtn = await driver.wait(
                    until.elementLocated(By.xpath('//a[contains(.,"Appointment")] | //button[contains(.,"Appointment")]')),
                    WAIT
                );

                // force click (React-safe)
                await driver.executeScript("arguments[0].scrollIntoView(true);", appointBtn);
                await driver.executeScript("arguments[0].click();", appointBtn);

                // 🔥 WAIT FOR FORM (NOT using name anymore)
                const genModelEl = await driver.wait(
                    until.elementLocated(By.xpath('//label[contains(.,"Generator Model")]/following::input[1]')),
                    WAIT
                );

                // --- FILL FORM ---
                await genModelEl.clear();
                await genModelEl.sendKeys(genModel);

                const serialEl = await driver.wait(
    until.elementLocated(By.xpath('//label[contains(.,"Serial Number")]/following::input[1]')),
    WAIT
);
await serialEl.clear();
await serialEl.sendKeys(serialNum);

                const descriptionEl = await driver.wait(
    until.elementLocated(By.xpath('//label[contains(.,"Problem") or contains(.,"Description")]/following::textarea[1]')),
    WAIT
);
await descriptionEl.clear();
await descriptionEl.sendKeys(description);
                // --- TIME BUTTON ---
                // Try to find ANY clickable time/date button
// --- DATE/TIME PICKER ---
// --- DATE/TIME PICKER (FORCE SET VALUE) ---

// Find any date/time input field
// --- DATE ---
const dateInput = await driver.wait(
    until.elementLocated(By.css('input[type="date"]')),
    WAIT
);

// set date (must match format YYYY-MM-DD)
await dateInput.clear();
await dateInput.sendKeys("2026-03-25");

// trigger React change
await driver.executeScript(`
    arguments[0].dispatchEvent(new Event('input', { bubbles: true }));
    arguments[0].dispatchEvent(new Event('change', { bubbles: true }));
`, dateInput);

await driver.sleep(1000);


// --- TIME SLOT (click one of the grid buttons) ---
const timeSlot = await driver.wait(
    until.elementLocated(
        By.xpath('//button[contains(.,"AM") or contains(.,"PM")]')
    ),
    WAIT
);

// scroll + click
await driver.executeScript("arguments[0].scrollIntoView(true);", timeSlot);
await driver.executeScript("arguments[0].click();", timeSlot);

await driver.sleep(1000);
                // --- SUBMIT ---
                const submitBtn = await driver.findElement(
                    By.xpath('//button[contains(.,"Submit")]')
                );
                await driver.wait(until.elementIsEnabled(submitBtn), WAIT);
                await submitBtn.click();

                await driver.sleep(5000);

                // --- HOME BUTTON (optional) ---
                const homeBtn = await driver.findElement(
                    By.xpath('//a[contains(.,"Home")]')
                ).catch(() => null);

                if (homeBtn) await homeBtn.click();

                const t1 = performance.now();
                const ms = t1 - t0;
                times.push(ms);
                console.log(`Run ${i}/${runs}: SUCCESS (${ms.toFixed(1)} ms)`);

            } catch (e) {
                failures++;
                console.log(`Run ${i}/${runs}: FAIL -> ${e.message}`);
            }
        }

    } finally {
        await driver.quit();
    }

    // --- RESULTS ---
    if (times.length) {
        const sum = times.reduce((a, b) => a + b, 0);
        console.log("\n=== RESULTS ===");
        console.log(`Runs: ${runs}`);
        console.log(`Success: ${times.length}`);
        console.log(`Failures: ${failures}`);
        console.log(`Avg: ${(sum / times.length).toFixed(1)} ms`);
        console.log(`Min: ${Math.min(...times).toFixed(1)} ms`);
        console.log(`Max: ${Math.max(...times).toFixed(1)} ms`);
    }
}

requestAppointment();