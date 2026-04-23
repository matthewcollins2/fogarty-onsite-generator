import { Builder, By, until } from 'selenium-webdriver';

async function emailVal() {

    let driver = await new Builder().forBrowser('chrome').build();
    const WAIT = 15000; // ms, how long to wait for the element to be located before throwing an error.
    const runs = 1;
    const times = [];
    let failures = 0;
    const password = "nasAAbb22##23131B2aa2d2aaa21Ga";
  
    for(let i = 1; i <= runs; i++) {
        try {
            // launch the application
            await driver.get("http://localhost:5173");
            const t0 = performance.now();

            // request account btn
            await (await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/header/div/div/div[1]/a[7]')),WAIT)).click();

            // text
            await (await driver.wait(until.elementLocated(By.css('input[placeholder="First Name"]')),WAIT)).sendKeys("aa");
            await (await driver.wait(until.elementLocated(By.css('input[placeholder="Last Name"]')),WAIT)).sendKeys("aa");
            await (await driver.wait(until.elementLocated(By.css('input[placeholder="User ID"]')),WAIT)).sendKeys("aa");
            await (await driver.wait(until.elementLocated(By.css('input[placeholder="Email"]')),WAIT)).sendKeys("deleteMeEmailVal@gmail.com");
            await (await driver.wait(until.elementLocated(By.css('input[placeholder="Phone Number"]')),WAIT)).sendKeys(1111111111);
            await (await driver.wait(until.elementLocated(By.css('input[placeholder="Password"]')),WAIT)).sendKeys(password);
            await (await driver.wait(until.elementLocated(By.css('input[placeholder="Street"]')),WAIT)).sendKeys("aa");
            await (await driver.wait(until.elementLocated(By.css('input[placeholder="City"]')),WAIT)).sendKeys("aa");
            await (await driver.wait(until.elementLocated(By.css('input[placeholder="ZIP Code"]')),WAIT)).sendKeys(11111);
            // state btn
            await (await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div[1]/form/div[1]/div[10]/div/div')),WAIT)).click();
            await driver.sleep(1000);
            await (await driver.wait(until.elementLocated(By.xpath('/html/body/div[2]/div[3]/ul/li[5]')),WAIT)).click();

            // create account btn
            await (await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div[1]/form/div[2]/button')),WAIT)).click();
            await driver.sleep(5000);

            
            // go home  
            await driver.get("http://localhost:5173");

            // click request app
            await (await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/div[1]/div/div[1]/div[2]/a[1]')),WAIT)).click();

            // click send verf link button
            await (await driver.wait(until.elementLocated(By.xpath('//*[@id="root"]/button')),WAIT)).click();
            const t1 = performance.now();
            const ms = t1 - t0;
            times.push(ms);
            console.log(`Run ${i}/${runs}: ${ms.toFixed(1)} ms`);
            await driver.sleep(5000);
        } catch(e) {
            failures++;
            console.log(`Run ${i}/${runs}: FAIL -> ${e.message}`);
        } finally {
            await driver.quit();
        }
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

emailVal();