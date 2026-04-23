import { test, expect } from '@playwright/test';
import fs from 'fs';

const projectId = 'seniorproject191-cb9b5';
const emulatorAuthUrl = `http://127.0.0.1:9099/identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts`;

test.beforeEach(async ({ request }) => {
    const fileContent = fs.readFileSync('./tests/test-email.json', 'utf8');
    const { email } = JSON.parse(fileContent);

    await request.post(emulatorAuthUrl, {
        data: {
            email: email,
            password: 'TemporaryPassword123!',
            returnSecureToken: true
        }
    });
});

test('Password reset works and allows new login', async ({ page, request }) => {
    const newPassword = 'NewSecurePassword2026!';
    const appBaseUrl = 'http://localhost:5173';

    const fileContent = fs.readFileSync('./tests/test-email.json', 'utf8');
    const testEmail = JSON.parse(fileContent).email;

    // 1. Request Reset
    await page.goto('/forgot-password');
    await page.getByLabel('Email Address').fill(testEmail);
    await page.getByRole('button', { name: 'Send Reset Link' }).click();
    await expect(page.getByText(/check your inbox/i)).toBeVisible();

    await page.getByRole('link', { name: /back to login/i }).click();
    await expect(page).toHaveURL(/.*userlogin/);

    // 2. Poll Emulator for the Link
    const emulatorUrl = `http://127.0.0.1:9099/emulator/v1/projects/${projectId}/oobCodes`;
    let resetEntry;

    await expect.poll(async () => {
        const response = await request.get(emulatorUrl);
        const body = await response.json();
        const codes = body.oobCodes?.filter(c => c.email === testEmail);

        if (codes && codes.length > 0) {
            resetEntry = codes[codes.length - 1];
            return true;
        }
        return false;
    }, {
        message: `Wait for the LATEST reset link for ${testEmail}`,
        timeout: 15000,
    }).toBeTruthy();

    // 3. Navigate to the CORRECT Route with Parameters
    const urlParts = new URL(resetEntry.oobLink);
    const finalResetLink = `${appBaseUrl}/forgot-password${urlParts.search}`;

    // Fix for all browsers: Ensure the page and Firebase SDK are fully settled
    await page.goto(finalResetLink, { waitUntil: 'networkidle' });

    // PRE-CHECK: If the code is already burnt on load, fail early with a helpful message
    const errorAlert = page.getByRole('alert').filter({ hasText: /error|invalid/i });
    if (await errorAlert.isVisible()) {
        const msg = await errorAlert.innerText();
        throw new Error(`Code was invalid immediately on page load: ${msg}`);
    }

    // 4. Complete the reset form
    const resetPasswordInput = page.locator('input[type="password"]').first();
    await expect(resetPasswordInput).toBeEditable({ timeout: 15000 });
    await resetPasswordInput.fill(newPassword);

    // Give a small buffer for state updates before clicking
    await page.waitForTimeout(300);
    await page.getByRole('button', { name: /update|save|reset/i }).click();

    // 5. Success Check
    // Use toPass to handle the brief moment between clicking and the UI updating
    await expect(async () => {
        const successMessage = page.getByText(/password changed/i);
        const currentError = page.getByRole('alert').filter({ hasText: /error|invalid/i });

        // If an error pops up AFTER clicking, it's a real failure
        if (await currentError.isVisible()) {
            const msg = await currentError.innerText();
            expect(msg).not.toContain('invalid-action-code');
        }

        await expect(successMessage).toBeVisible();
    }).toPass({ timeout: 10000 });

    // 6. Final Login Verification
    await page.goto('/userlogin');
    await page.getByLabel(/email/i).fill(testEmail);
    await page.locator('input[type="password"]').last().fill(newPassword);
    await page.getByRole('button', { name: /login|sign in/i }).click();

    await expect(page.getByRole('button', { name: /logout/i })).toBeVisible({ timeout: 10000 });
    await expect(page).toHaveURL(/.*dashboard|.*home|.*\//);
});
