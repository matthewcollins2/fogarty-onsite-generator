import { Builder, By, until } from 'selenium-webdriver';

async function partsRequest() {

    let driver = await new Builder().forBrowser('chrome').build();
    const WAIT = 15000; // ms, how long to wait for the element to be located before throwing an error.
    const runs = 5;
    const times = [];
    let failures = 0;
    const address = "1029 Street, City";
    const partName = "CoolPart";
    const description = "testing notifs";
    const id = "user@gmail.com";       //test email and id      
    const password = "SuperCoolUserP@ss?";
  
    try {
        // launch the application
        await driver.get("http://localhost:5173");

        // login section
        // sign in btn
        await (await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/header/div/div/div[2]/a')),WAIT)).click();

        // email input
        await (await driver.wait(until.elementLocated(By.css('input[type="Email"]')),WAIT)).sendKeys(id);;

        // password input
        await (await driver.wait(until.elementLocated(By.css('input[type="Password"]')),WAIT)).sendKeys(password);;

        // login btn
        await (await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/main/div/form/button')),WAIT)).click();;

        await driver.sleep(5000);

        // loop only the parts request section
        for (let i = 1; i <= runs; i++) {
        const t0 = performance.now();

        try {
            // appointment request section

            // service btn
            await (await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/header/div/div/div[1]/a[3]')), WAIT)).click();

            // parts btn
            await (await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div[1]/div/div[2]/a')), WAIT)).click();
            
            // address input
            await (await driver.wait(until.elementLocated(By.css('input[name="address"]')), WAIT)).sendKeys(address);

            // part name input
            await (await driver.wait(until.elementLocated(By.css('input[name="part"]')),WAIT)).sendKeys(partName);

            // description input
            await (await driver.wait(until.elementLocated(By.css('textarea[name="additionalInformation"]')),WAIT)).sendKeys(description);

            // submit btn
            await (await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div[1]/div/form/div/button')),WAIT)).click();

            await driver.sleep(10000); // wait 10 seconds for text to send

            // home btn
            await (await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/header/div/div/div[1]/a[1]')),WAIT)).click();

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

partsRequest();