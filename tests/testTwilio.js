import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Load environment variables from the root .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  console.error("Missing Twilio credentials in .env file.");
  process.exit(1);
}

const client = twilio(accountSid, authToken);

async function testTwilioSMS() {
  // Use a destination number from command line arguments, or prompt if missing.
  // Virtual Test Number is +18777804236
  const toPhoneNumber = process.argv[2];

  if (!toPhoneNumber) {
    console.error("Please provide a destination phone number to test.");
    console.log("Usage: node testTwilio.js <phone_number>");
    console.log("Example: node testTwilio.js +12345678901");
    process.exit(1);
  }

  console.log(`Attempting to send a test SMS to ${toPhoneNumber} from ${twilioPhoneNumber}...`);

  try {
    const message = await client.messages.create({
      body: 'Hello! This is an automated test message from Fogarty Generator Services.',
      from: twilioPhoneNumber,
      to: toPhoneNumber,
    });

    console.log();
    console.log('Twilio Test Successful!');
    console.log(`Message SID: ${message.sid}`);
    console.log(`Status: ${message.status}`);

    const result = {
      success: true,
      timestamp: new Date().toISOString(),
      to: toPhoneNumber,
      from: twilioPhoneNumber,
      messageSid: message.sid,
      status: message.status
    };
    saveResult(result);
  } catch (error) {
    console.error('\n Failed to send SMS via Twilio:');
    console.error(error.message || error);
    if (error.code) {
      console.error(`Twilio Error Code: ${error.code}`);
      console.error(`More Info: https://www.twilio.com/docs/api/errors/${error.code}`);
    }

    const result = {
      success: false,
      timestamp: new Date().toISOString(),
      to: toPhoneNumber,
      from: twilioPhoneNumber,
      error: error.message || String(error),
      code: error.code || null
    };
    saveResult(result);
  }
}

function saveResult(data) {
  const dir = path.resolve(__dirname, '../test-results');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const file = path.resolve(dir, 'twilio-result.json');
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  console.log(`Saved test results to ${file}`);
}

testTwilioSMS();
