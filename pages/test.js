const axios = require('axios');

// Base URL for the summarize endpoint
const BASE_URL = 'http://localhost:3000/summarize';

// Test cases for various modes
const testCases = [
    { mode: 'simple', input: 'This is a test input for simple mode.', expected: 'Expected output for simple mode.' },
    { mode: 'detailed', input: 'Another test input for detailed mode.', expected: 'Expected output for detailed mode.' },
    { mode: 'error', input: '', expected: 'Expected error response for empty input.' },
    // Add more test cases as needed
];

async function runTests() {
    for (const testCase of testCases) {
        try {
            const response = await axios.post(BASE_URL, { mode: testCase.mode, input: testCase.input });
            console.log(`Mode: ${testCase.mode}, Status: ${response.status}, Expected: ${testCase.expected}, Actual: ${response.data}`);
        } catch (error) {
            console.log(`Mode: ${testCase.mode}, Error: ${error.response.data}`);
        }
    }
}

runTests();