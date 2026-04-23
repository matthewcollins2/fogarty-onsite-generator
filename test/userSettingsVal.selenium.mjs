import { Builder, By, until, Key } from "selenium-webdriver";
import { send } from "vite";

// in the terminal, run the test with 'node test/userSettingsVal.selenium.mjs'

async function testUserSettingsInputs() {
    const driver = await new Builder().forBrowser("chrome").build(); //specific browser to use, 

    const invalidBlank = "";
    const invalidWhiteSpace = "      ";
    const invalidName = "J@NE";
    const invalidID = "John Doe";
    const invalidEmail = "jeo aw@gmail.com";
    const invalidPhone = "987AW";
    const invalidPass = "simplePass32";
    const invalidStreet = "Aw @ Shasta";
    const invalidCity = "New Y@rk";
    const invalidZip = "john";

    const validName = "Mary Jane";
    const validName2 = "Mary";
    const validID = "johndoe";
    const validEmail = "realemailfortesting@gmail.com";
    const validEmail2 = "henryhill@csus.edu";
    const validPhone = "8547895120";
    const validPhone2 = "1475648520";
    const validPass = "newAAbb22##aaaaaaaaaaaaaaaaaaaaaaaaa";
    const validPass2 = "$2b$12$lFgryF47q7aUbYBJgh"
    const validStreet = "12th Ave";
    const validStreet2 = "13th Street";
    const validCity = "Site 13";
    const validCity2 = "Site 14";
    const validZip = "98765";
    const validZip2 = "12345";


    const WAIT = 10000; //ms, how long to wait for the element to be located before throwing an error.

    const runs = 1;
    const times = [];
    let failures = 0;

    // tries to click create user button
    async function clickCreateAccount() {
        const submitButton = await driver.wait(
            until.elementLocated(By.xpath('//*[@id="root"]/div[1]/form/div[2]')),
            WAIT
        );
        await driver.wait(until.elementIsVisible(submitButton), WAIT);
        await submitButton.click();
    }

    // tries to click update user button
    async function clickUpdateAccount(element) {
        const submitButton = await driver.wait(
            until.elementLocated(By.xpath(element)),
            WAIT
        );
        await driver.wait(until.elementIsVisible(submitButton), WAIT);
        await submitButton.click();
    }

    // goes through user registration inputs
    async function testUserRegistration(element, invalid, valid) {
        // find input
        let input = await driver.wait(
            until.elementLocated(By.css(element)),
            WAIT
        );
        await driver.wait(until.elementIsVisible(input), WAIT);
        await input.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));   // clear the input field 
        await input.sendKeys(Key.chord(invalidBlank)); // and enter input, ""
        // try to click button
        await clickCreateAccount();
        // click, enter "     ";
        await driver.wait(until.elementIsVisible(input), WAIT);
        await input.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));
        await input.sendKeys(Key.chord(invalidWhiteSpace));
        // try to click button
        await clickCreateAccount();
        // click, enter invalid
        await driver.wait(until.elementIsVisible(input), WAIT);
        await input.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));
        await input.sendKeys(Key.chord(invalid));
        // try to click button
        await clickCreateAccount();
        // click, enter valid
        await driver.wait(until.elementIsVisible(input), WAIT);
        await input.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));
        await input.sendKeys(valid);
    }

    // goes through user update inputs
    async function testUserSettings(elementField, invalid, valid) {
        // find input
        let input = await driver.wait(
            until.elementLocated(By.css(elementField)),
            WAIT
        );
        await driver.wait(until.elementIsVisible(input), WAIT);
        await input.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));   // clear the input field 
        await input.sendKeys(Key.chord(invalidBlank)); // and enter input, ""
        // click, enter "     ";
        await driver.wait(until.elementIsVisible(input), WAIT);
        await input.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));
        await input.sendKeys(Key.chord(invalidWhiteSpace));
        // click, enter invalid
        await driver.wait(until.elementIsVisible(input), WAIT);
        await input.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));
        await input.sendKeys(Key.chord(invalid));
        // click, enter valid
        await driver.wait(until.elementIsVisible(input), WAIT);
        await input.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));
        await input.sendKeys(valid);
        await new Promise(r => setTimeout(r, 500));
    }
    
    // goes through user update inputs
    async function testUserSettingsID(elementField, invalid, valid) {
        // find input
        let input = await driver.wait(
            until.elementLocated(By.xpath(elementField)),
            WAIT
        );
        await driver.wait(until.elementIsVisible(input), WAIT);
        await input.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));   // clear the input field 
        await input.sendKeys(Key.chord(invalidBlank)); // and enter input, ""
        // click, enter "     ";
        await driver.wait(until.elementIsVisible(input), WAIT);
        await input.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));
        await input.sendKeys(Key.chord(invalidWhiteSpace));
        // click, enter invalid
        await driver.wait(until.elementIsVisible(input), WAIT);
        await input.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));
        await input.sendKeys(Key.chord(invalid));
        // click, enter valid
        await driver.wait(until.elementIsVisible(input), WAIT);
        await input.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));
        await input.sendKeys(valid);
        await new Promise(r => setTimeout(r, 500));
    }
    
    try {
        for (let i = 1; i <= runs; i++) {
        const t0 = performance.now();

        try {
            // launch the application
            await driver.get("http://localhost:5173");

            // click request account
            const signInBtn = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/header/div/div/div[1]/a[7]')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(signInBtn), WAIT);
            await signInBtn.click();
            
            // enter invalid and valid inputs
            await testUserRegistration('input[placeholder="First Name"]', invalidName, validName);
            await testUserRegistration('input[placeholder="Last Name"]', invalidName, validName);
            await testUserRegistration('input[placeholder="User ID"]', invalidID, validID);
            await testUserRegistration('input[placeholder="Email"]', invalidEmail, validEmail);
            await testUserRegistration('input[placeholder="Phone Number"]', invalidPhone, validPhone);
            await testUserRegistration('input[placeholder="Password"]', invalidPass, validPass);
            await testUserRegistration('input[placeholder="Street"]', invalidStreet, validStreet);
            await testUserRegistration('input[placeholder="City"]', invalidCity, validCity);
            await testUserRegistration('input[placeholder="ZIP Code"]', invalidZip, validZip);
            // click state and select CA
            const stateBtn = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/div[1]/form/div[1]/div[9]/div/div')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(stateBtn), WAIT);
            await stateBtn.click();
            const caliBtn = await driver.wait(
                until.elementLocated(By.xpath('/html/body/div[2]/div[3]/ul/li[5]')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(caliBtn), WAIT);
            await caliBtn.click();

            // create a new user
            await clickCreateAccount();
            await new Promise(r => setTimeout(r, 4000));

            // go to user settings
            const userSettings = await driver.wait(
                until.elementLocated(By.xpath('/html/body/div/header/div/div/div[2]/div/div/a')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(userSettings), WAIT);
            await userSettings.click();

            // -----NAME-----
            const settingName = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/div[1]/div/div/div[1]/div/div[2]/button')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(settingName), WAIT);
            await settingName.click();
            // edit name settings
            await testUserSettings('input[placeholder="First Name"]', invalidName, validName2);
            await testUserSettings('input[placeholder="Last Name"]', invalidName, validName2);
            await clickUpdateAccount('//*[@id="root"]/div[1]/div/div/div[2]/div/div[2]/button[2]');
            await new Promise(r => setTimeout(r, 1000));

            // ----PASSWORD------
            const settingPass = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/div[1]/div/div/div[7]/div/div[2]/button')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(settingPass), WAIT);
            await settingPass.click();
            // edit password settings
            await testUserSettingsID('/html/body/div/div[1]/div[1]/div/div[8]/div/div[1]/div[1]/div/input', invalidPass, validPass);
            await testUserSettingsID('/html/body/div/div[1]/div[1]/div/div[8]/div/div[1]/div[2]/div/input', invalidPass, validPass2);
            await clickUpdateAccount('//*[@id="root"]/div[1]/div/div/div[8]/div/div[2]/button[2]');
            await new Promise(r => setTimeout(r, 1000));

            // ----EMAIL------
            const settingEmail = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/div[1]/div/div/div[3]/div/div[2]/button')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(settingEmail), WAIT);
            await settingEmail.click();
            // edit email settings
            await testUserSettingsID('/html/body/div/div[1]/div[1]/div/div[4]/div/div[1]/div[1]/div/input', invalidPass, validPass2);
            await testUserSettings('input[placeholder="Email"]', invalidEmail, validEmail2);
            // click decline since it cannot click the auth email link
            await clickUpdateAccount('//*[@id="root"]/div[1]/div/div/div[4]/div/div[2]/button[1]');
            await new Promise(r => setTimeout(r, 1000));

            // ----PHONE------
            const settingPhone = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/div[1]/div/div/div[5]/div/div[2]/button')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(settingPhone), WAIT);
            await settingPhone.click();
            // edit phone settings
            await testUserSettings('input[placeholder="Phone Number"]', invalidPhone, validPhone2);
            await clickUpdateAccount('//*[@id="root"]/div[1]/div/div/div[6]/div/div[2]/button[2]');
            await new Promise(r => setTimeout(r, 1000));

            // ----ADDRESS------
            const settingAdd = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/div[1]/div/div/div[9]/div/div[2]/button')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(settingAdd), WAIT);
            await settingAdd.click();
            // edit address settings
            await testUserSettings('input[placeholder="Street"]', invalidStreet, validStreet2);
            await testUserSettings('input[placeholder="City"]', invalidCity, validCity2);
            await testUserSettings('input[placeholder="ZIP Code"]', invalidZip, validZip2);
            // click state and select AZ
            const settingState = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/div[1]/div/div/div[10]/div/div[1]/div[3]/div')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(settingState), WAIT);
            await settingState.click();
            const azBtn = await driver.wait(
                until.elementLocated(By.xpath('/html/body/div[2]/div[3]/ul/li[3]')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(azBtn), WAIT);
            await azBtn.click();
            await clickUpdateAccount('//*[@id="root"]/div[1]/div/div/div[10]/div/div[2]/button[2]');
            await new Promise(r => setTimeout(r, 1000));

            // logout
            const logout = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/header/div/div/div[2]/div/button')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(logout), WAIT);
            await logout.click();

            // go back to homepage
            await driver.get("http://localhost:5173");

            // try to login with old info
            const login = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/header/div/div/div[2]/a')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(login), WAIT);
            await login.click();
            // enter old email
            const enterEmail = await driver.wait(
                until.elementLocated(By.css('input[type="email"]')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(enterEmail), WAIT);
            await enterEmail.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));   // clear the input field 
            await enterEmail.sendKeys(Key.chord(validEmail)); // and enter input
            // enter old pass
            const enterPass = await driver.wait(
                until.elementLocated(By.css('input[type="password"]')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(enterPass), WAIT);
            await enterPass.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));   // clear the input field 
            await enterPass.sendKeys(Key.chord(validPass)); // and enter input
            // click sign in
            const loginBtn = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/main/div/form/button')),
                WAIT
            );
            await driver.wait(until.elementIsEnabled(loginBtn), WAIT);
            await loginBtn.click();
            await new Promise(r => setTimeout(r, 1000));
            await driver.wait(until.elementIsVisible(enterPass), WAIT);
            await enterPass.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));   // clear the input field 
            await enterPass.sendKeys(Key.chord(validPass2)); // and enter input
            await driver.wait(until.elementIsEnabled(loginBtn), WAIT);
            await loginBtn.click();
            await new Promise(r => setTimeout(r, 4000));

            // -------------delete account---------
            // go to user settings
            const sett = await driver.wait(
                until.elementLocated(By.xpath('/html/body/div/header/div/div/div[2]/div/div/a')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(sett), WAIT);
            await sett.click();
            // click delete button
            // click request account
            const deleteBtn = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/div[1]/button[2]')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(deleteBtn), WAIT);
            await deleteBtn.click();
            // enter old pass
            const enterOld = await driver.wait(
                until.elementLocated(By.xpath('/html/body/div/div[1]/div[2]/div/div[1]/div/div/input')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(enterOld), WAIT);
            await enterOld.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));   // clear the input field 
            await enterOld.sendKeys(Key.chord(validPass)); // and enter input
            // enter curr pass
            const enterNew = await driver.wait(
                until.elementLocated(By.xpath('/html/body/div/div[1]/div[2]/div/div[1]/div/div/input')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(enterNew), WAIT);
            await enterNew.sendKeys(Key.chord(Key.CONTROL,"a", Key.DELETE));   // clear the input field 
            await enterNew.sendKeys(Key.chord(validPass2)); // and enter input
            // delete account
            const deleteAcc = await driver.wait(
                until.elementLocated(By.xpath('//*[@id="root"]/div[1]/div[2]/div/div[2]/button[2]')),
                WAIT
            );
            await driver.wait(until.elementIsVisible(deleteAcc), WAIT);
            await deleteAcc.click();


            // wait 0.5 seconds
            await new Promise(r => setTimeout(r, 5000));
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


testUserSettingsInputs();