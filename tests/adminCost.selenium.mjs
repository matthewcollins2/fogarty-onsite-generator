import selenium from 'selenium-webdriver';
const { Builder, By, until } = selenium;

async function adminCost() {

    let driver = await new Builder().forBrowser('chrome').build();
    const WAIT = 20000;

    const id = "testingemail@gmail.com";
    const password = "passswrddddd";
    const cost = "700";

    try {
        // ---------------- OPEN APP ----------------
        await driver.get("http://localhost:5173");

        // ---------------- SIGN IN ----------------
        const signInBtn = await driver.wait(
            until.elementLocated(
                By.xpath('//*[@id="root"]/header/div/div/div[2]/a')
            ),
            WAIT
        );
        await driver.executeScript("arguments[0].click();", signInBtn);

        // ---------------- LOGIN ----------------
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
            until.elementLocated(
                By.xpath('//*[@id="root"]/main/div/form/button')
            ),
            WAIT
        );
        await driver.executeScript("arguments[0].click();", loginBtn);

        console.log("✅ Logged in");

        await driver.sleep(3000);

        // ---------------- ADMIN DASHBOARD ----------------
        const adminBtn = await driver.wait(
            until.elementLocated(By.xpath('//*[contains(text(),"Admin")]')),
            WAIT
        );
        await driver.executeScript("arguments[0].click();", adminBtn);

        console.log("📍 Admin Dashboard opened");

        // ---------------- INCOMING REQUESTS ----------------
        const incomingBtn = await driver.wait(
            until.elementLocated(By.xpath('//*[contains(text(),"Incoming Requests")]')),
            WAIT
        );
        await driver.executeScript("arguments[0].click();", incomingBtn);

        await driver.sleep(1000);

        const appointmentReq = await driver.wait(
            until.elementLocated(By.xpath('//*[contains(text(),"Appointment Request")]')),
            WAIT
        );
        await driver.executeScript("arguments[0].click();", appointmentReq);

        console.log("📍 Appointment Request list opened");

        // ---------------- WAIT TABLE LOAD ----------------
        await driver.sleep(3000);

        // ---------------- GET ROWS (FIX FOR YOUR TIMEOUT ISSUE) ----------------
        const rows = await driver.findElements(
            By.xpath("//tr | //div[contains(@class,'MuiDataGrid-row')]")
        );

        console.log("Rows found:", rows.length);

        if (rows.length === 0) {
            throw new Error("No appointment rows loaded");
        }

        // take latest row (your newly created appointment)
        const targetRow = rows[rows.length - 1];

        await driver.executeScript(
            "arguments[0].scrollIntoView({block:'center'});",
            targetRow
        );

        await driver.sleep(1000);

        // ---------------- CLICK VIEW (GLOBAL FIX) ----------------
        const viewBtn = await driver.wait(
            until.elementLocated(
                By.xpath("//button[contains(.,'View')] | //a[contains(.,'View')]")
            ),
            WAIT
        );

        await driver.executeScript("arguments[0].click();", viewBtn);

        console.log("👁️ View clicked");

        await driver.sleep(2000);

        // ---------------- ACCEPT ----------------
        const acceptBtn = await driver.wait(
            until.elementLocated(By.xpath('//button[contains(.,"Accept")]')),
            WAIT
        );

        await driver.executeScript("arguments[0].click();", acceptBtn);

        console.log("✅ Accepted appointment");

        // ---------------- SET COST ----------------
        const costInput = await driver.wait(
            until.elementLocated(By.xpath('//input')),
            WAIT
        );

        await costInput.clear();
        await costInput.sendKeys(cost);

        // ---------------- UPDATE ----------------
        const updateBtn = await driver.wait(
            until.elementLocated(By.xpath('//button[contains(.,"Update")]')),
            WAIT
        );

        await driver.executeScript("arguments[0].click();", updateBtn);

        console.log("💰 Cost updated to 700");

        await driver.sleep(3000);

        console.log("🎉 ADMIN COST FLOW COMPLETE");

    } catch (err) {
        console.log("❌ ERROR:", err.message);
    } finally {
        await driver.quit();
    }
}

adminCost();
