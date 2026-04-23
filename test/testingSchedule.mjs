import { Builder, By, until } from "selenium-webdriver";
import dotenv from "dotenv"
dotenv.config();

//node test/testingSchedule.mjs
async function testSchedule() {
  const driver = await new Builder().forBrowser("chrome").build();
  await driver.manage().window().maximize();

  const id = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;

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

  async function goToAppointmentPage() {
    const apptBtn = await driver.wait(
      until.elementLocated(By.css('a[href="/Appointment"]')),
      WAIT
    );
    await driver.wait(until.elementIsVisible(apptBtn), WAIT);
    await apptBtn.click();

    // wait until appointment form is loaded
    await driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div/div[1]/div/div[1]/form/div[2]/div/input')),
      WAIT
    );
  }

  async function createAppointment(generator, serial, problem, slotXpath) {
    // always re-find elements fresh
    const genE = await driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div/div[1]/div/div[1]/form/div[2]/div/input')),
      WAIT
    );
    await driver.wait(until.elementIsVisible(genE), WAIT);
    await genE.clear();
    await genE.sendKeys(generator);

    const serialE = await driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div/div[1]/div/div[1]/form/div[3]/div/input')),
      WAIT
    );
    await driver.wait(until.elementIsVisible(serialE), WAIT);
    await serialE.clear();
    await serialE.sendKeys(serial);

    const problemE = await driver.wait(
      until.elementLocated(By.xpath('/html/body/div/div/div[1]/div/div[1]/form/div[4]/div/textarea[1]')),
      WAIT
    );
    await driver.wait(until.elementIsVisible(problemE), WAIT);
    await problemE.clear();
    await problemE.sendKeys(problem);

    const slotBtn = await driver.wait(
      until.elementLocated(By.xpath(slotXpath)),
      WAIT
    );
    await driver.wait(until.elementIsVisible(slotBtn), WAIT);
    await slotBtn.click();

    const submitBtn = await driver.wait(
      until.elementLocated(By.css('button[type="submit"]')),
      WAIT
    );
    await driver.wait(until.elementIsEnabled(submitBtn), WAIT);
    await submitBtn.click();

    // optional: wait for success message, redirect, or page stability
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
  async function goToAppointmentRequests(){
    const incomingRequestBtn = await driver.wait(
          until.elementLocated(By.xpath("//p[contains(., 'Incoming Requests')]")),
          WAIT                        
      );
      await driver.wait(until.elementIsVisible(incomingRequestBtn),WAIT);
      await incomingRequestBtn.click();
    
      const appointmentRequestBtn = await driver.wait(
          until.elementLocated(By.xpath("//p[contains(., 'Appointment Requests')]")),
          WAIT                          
      );
      await driver.wait(until.elementIsVisible(appointmentRequestBtn),WAIT);
      await appointmentRequestBtn.click();
  }
async function acceptSchedule() {
  await driver.sleep(500);

  const viewButtons = await driver.findElements(
    By.xpath("//button[contains(., 'View')]")
  );

  if (viewButtons.length === 0) {
    console.log("Finished all pending appointments.");
    return false;
  }

  const firstViewBtn = viewButtons[0];
  await driver.wait(until.elementIsVisible(firstViewBtn), WAIT);
  await firstViewBtn.click();

  const requestedEl = await driver.wait(
    until.elementLocated(By.xpath("//p[contains(., 'Requested:')]")),
    WAIT
  );
  await driver.wait(until.elementIsVisible(requestedEl), WAIT);

  const requestedText = await requestedEl.getText();
  console.log("Requested text:", requestedText);

  if (requestedText.includes("@ 9:00 AM")) {
    const acceptBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Accept')]")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(acceptBtn), WAIT);
    await acceptBtn.click();

    const updateBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Update')]")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(updateBtn), WAIT);
    await updateBtn.click();

  } else if (requestedText.includes("@ 10:00 AM")) {
    const acceptBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Accept')]")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(acceptBtn), WAIT);
    await acceptBtn.click();

    const changeEndPointBtn = await driver.wait(
      until.elementLocated(By.xpath("/html/body/div[2]/div[3]/div/div[1]/div/div[2]/div/div/div/div[2]/div/button[9]")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(changeEndPointBtn), WAIT);
    await changeEndPointBtn.click();

    const updateBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Update')]")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(updateBtn), WAIT);
    await updateBtn.click();

  } else if (requestedText.includes("@ 11:00 AM")) {
    const acceptBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Accept')]")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(acceptBtn), WAIT);

    await driver.wait(async () => {
      const btn = await driver.findElement(By.xpath("//button[contains(., 'Accept')]"));
      return !(await btn.isEnabled());
    }, WAIT);

    const finalAcceptBtn = await driver.findElement(By.xpath("//button[contains(., 'Accept')]"));
    const isEnabled = await finalAcceptBtn.isEnabled();

    if (!isEnabled) {
      console.log("Success: Accept button is correctly blocked for 11:00 AM");

      const rescheduleBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Reschedule')]")),
        WAIT
      );
      await driver.wait(until.elementIsVisible(rescheduleBtn), WAIT);
      await rescheduleBtn.click();

      const changeTo1200 = await driver.wait(
        until.elementLocated(By.xpath("/html/body/div[2]/div[3]/div/div[1]/div/div[2]/div/div/div/div[2]/div/div/button[9]")),
        WAIT
      );
      await driver.wait(until.elementIsVisible(changeTo1200), WAIT);
      await changeTo1200.click();

      const updateBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(., 'Update')]")),
        WAIT
      );
      await driver.wait(until.elementIsVisible(updateBtn), WAIT);
      await updateBtn.click();
    } else {
      console.log("Failure: Accept button was enabled when it should be blocked");
    }

  } else if (requestedText.includes("@ 1:00 PM")) {
    const denyBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Deny')]")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(denyBtn), WAIT);
    await denyBtn.click();

    const updateBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(., 'Update')]")),
      WAIT
    );
    await driver.wait(until.elementIsVisible(updateBtn), WAIT);
    await updateBtn.click();
  }

  await driver.sleep(1200);
  return true;
}
async function goToReviewedAppointments() {
  const reviewedBtn = await driver.wait(
    until.elementLocated(By.xpath("//p[normalize-space()='Reviewed Appointments']")),
    WAIT
  );
  await driver.wait(until.elementIsVisible(reviewedBtn), WAIT);
  await reviewedBtn.click();
}
async function verifyReviewedAppointments() {

  const scheduleDates = await driver.wait(async () => {
    const els = await driver.findElements(By.css('div[data-field="scheduleDate"]'));
    return els.length >= 3 ? els : false;
  }, WAIT);

  const actualTimes = [];

  for (const el of scheduleDates) {
    const fullText = await el.getText();
    const timePart = fullText.split("@")[1]?.trim();
    actualTimes.push(timePart);
  }

  console.log("Reviewed appointment times:", actualTimes);

  const expectedTimes = [
    "9:00 AM - 10:00 AM",
    "10:00 AM - 12:00 PM",
    "12:00 PM - 1:00 PM",
  ];

  for (const expected of expectedTimes) {
    if (actualTimes.includes(expected)) {
      console.log(`Success: found ${expected}`);
    } else {
      console.log(`Failure: missing ${expected}`);
    }
  }
}

async function verifyBlockedTimes() {
  const timeChecks = [
    { index: 3, label: "9:00 AM" },
    { index: 4, label: "9:30 AM" },
    { index: 5, label: "10:00 AM" },
    { index: 6, label: "10:30 AM" },
    { index: 7, label: "11:00 AM" },
    { index: 8, label: "11:30 AM" },
    { index: 9, label: "12:00 PM" },
    { index: 10, label: "12:30 PM" },
  ];

  for (const { index, label } of timeChecks) {
    const xpath = `/html/body/div/div/div[1]/div/div[2]/div/div[2]/div/div/div[${index}]//button`;

    const btn = await driver.wait(
      until.elementLocated(By.xpath(xpath)),
      WAIT
    );
    await driver.wait(until.elementIsVisible(btn), WAIT);

    const disabledAttr = await btn.getAttribute("disabled");
    const classAttr = await btn.getAttribute("class");

    const isBlocked =
      disabledAttr !== null ||
      (classAttr && classAttr.includes("Mui-disabled"));

    if (isBlocked) {
      console.log(`Success: ${label} is blocked`);
    } else {
      console.log(`Failure: ${label} is NOT blocked`);
    }
  }
}

async function deleteAppointments(){
  await driver.sleep(1000);
   while (true) {
    const deleteButtons = await driver.findElements(
      By.xpath("//button[contains(., 'Delete')]")
    );

    if (deleteButtons.length === 0) {
      console.log("All tests complete: no more appointments/tasks left.");
      return;
    }

    await driver.wait(until.elementIsVisible(deleteButtons[0]), WAIT);
    await deleteButtons[0].click();

    await driver.wait(until.alertIsPresent(), WAIT);
    const alert = await driver.switchTo().alert();
    console.log("Confirm text:", await alert.getText());
    await alert.accept();

    await driver.sleep(500);
  }
}

  try {
    await login();
   
    await goToAppointmentPage();
    await createAppointment(
      "generatorModelTest1",
      "serialNumberTest1",
      "problemDescriptionTest1",
      '/html/body/div/div/div[1]/div/div[2]/div/div[2]/div/div/div[3]/button'
    );

    await driver.get("http://localhost:5173");
    await goToAppointmentPage();
    await createAppointment(
      "generatorModelTest2",
      "serialNumberTest2",
      "problemDescriptionTest2",
      '/html/body/div/div/div[1]/div/div[2]/div/div[2]/div/div/div[5]/button'
    );

    await driver.get("http://localhost:5173");
    await goToAppointmentPage();
    await createAppointment(
      "generatorModelTest3",
      "serialNumberTest3",
      "problemDescriptionTest3",
      '/html/body/div/div/div[1]/div/div[2]/div/div[2]/div/div/div[7]/button'
    );

    await driver.get("http://localhost:5173");
    await goToAppointmentPage();
    await createAppointment(
      "generatorModelTest4",
      "serialNumberTest4",
      "problemDescriptionTest4",
      '/html/body/div/div/div[1]/div/div[2]/div/div[2]/div/div/div[11]/button'
    );
    
    await driver.get("http://localhost:5173")
    await goToAdminDashboard();
    await goToAppointmentRequests();

    while (await acceptSchedule()) {
      await driver.sleep(500);
    }

    await driver.sleep(1000);

    await goToReviewedAppointments()

    await verifyReviewedAppointments();
    
    await driver.get("http://localhost:5173")

    await goToAppointmentPage();

    await driver.sleep(1000);

    await verifyBlockedTimes();

    

    await driver.get("http://localhost:5173")

    await goToAdminDashboard();

    await goToReviewedAppointments();

    await deleteAppointments();


  } catch (err) {
    console.error("Error in testSchedule:", err);
  } finally {
    await driver.quit();
  }
}

testSchedule();