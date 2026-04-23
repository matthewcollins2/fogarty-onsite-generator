Current selenium webdriver is 4.41.0, by default, Selenium 4 is compatable with Chrome v75 and greater. Can check with terminal command
    npm list selenium-webdriver

Install selenium webdriver with terminal command
    npm install selenium-webdriver

Assumptions when testing website
1. The website is running on localhost:3000
2. The website is running in development mode (npm run dev)
3. The website is running in a browser that selenium webdriver can control (e.g., Chrome, Firefox)
4. The database, mongoDB, and S3 bucket are all running and accessible
5. The database, mongoDB, and S3 bucket do not store any objects that would interfere with the testing process (e.g., test objects, test data)
6. The database, mongoDB, has specific login credentials that are used for testing purposes and do not interfere with any production data

