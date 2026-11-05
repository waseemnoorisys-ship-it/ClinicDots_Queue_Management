import { validateRegisterPatient } from "../../modules/patient/validation/patient.validation.js";

const testCases = [
  { label: "4-digit number ('1234')", contact: "1234", shouldPass: false },
  { label: "6-digit number ('123456')", contact: "123456", shouldPass: false },
  { label: "8-digit number ('98765432')", contact: "98765432", shouldPass: false },
  { label: "12-digit number ('987654321012')", contact: "987654321012", shouldPass: false },
  { label: "10-digit starting with 5 ('5555555555')", contact: "5555555555", shouldPass: false },
  { label: "10-digit starting with 1 ('1234567890')", contact: "1234567890", shouldPass: false },
  { label: "Letters in contact ('98765abcd0')", contact: "98765abcd0", shouldPass: false },
  { label: "Valid 10-digit starting with 9 ('9876543210')", contact: "9876543210", shouldPass: true, expectedNormalized: "+919876543210" },
  { label: "Valid 10-digit starting with 8 ('8123456789')", contact: "8123456789", shouldPass: true, expectedNormalized: "+918123456789" },
  { label: "Valid 10-digit starting with 7 ('7012345678')", contact: "7012345678", shouldPass: true, expectedNormalized: "+917012345678" },
  { label: "Valid 10-digit starting with 6 ('6987654321')", contact: "6987654321", shouldPass: true, expectedNormalized: "+916987654321" },
  { label: "Valid with +91 prefix ('+919876543210')", contact: "+919876543210", shouldPass: true, expectedNormalized: "+919876543210" },
  { label: "Valid with spaces and dashes ('+91 98765-43210')", contact: "+91 98765-43210", shouldPass: true, expectedNormalized: "+919876543210" },
];

console.log("=========================================");
console.log(" TESTING MOBILE NUMBER VALIDATION");
console.log("=========================================");

let passedAll = true;

for (const tc of testCases) {
  let errorCaught = null;
  const req = {
    body: {
      hospitalId: "60c72b2f9b1d8b2bad000001",
      fname: "Test Patient",
      contact: tc.contact,
      age: "30",
      gender: "male",
    },
  };

  const next = (err) => {
    if (err) errorCaught = err;
  };

  validateRegisterPatient(req, {}, next);

  if (tc.shouldPass) {
    if (errorCaught) {
      console.error(`❌ FAILED: ${tc.label} was incorrectly rejected! Error: ${errorCaught.message}`);
      passedAll = false;
    } else if (req.body.contact !== tc.expectedNormalized) {
      console.error(`❌ FAILED: ${tc.label} normalized incorrectly. Got '${req.body.contact}', expected '${tc.expectedNormalized}'`);
      passedAll = false;
    } else {
      console.log(`✓ PASSED: ${tc.label} accepted & normalized to ${req.body.contact}`);
    }
  } else {
    if (errorCaught && errorCaught.statusCode === 400 && errorCaught.message.includes("valid 10-digit mobile number")) {
      console.log(`✓ PASSED: ${tc.label} correctly rejected with 400 error`);
    } else {
      console.error(`❌ FAILED: ${tc.label} was NOT rejected! Caught:`, errorCaught);
      passedAll = false;
    }
  }
}

if (passedAll) {
  console.log("\n=========================================");
  console.log("🎉 ALL MOBILE NUMBER VALIDATION TESTS PASSED!");
  console.log("=========================================");
  process.exit(0);
} else {
  console.error("\n❌ SOME TESTS FAILED!");
  process.exit(1);
}
