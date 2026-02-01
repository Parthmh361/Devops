#!/usr/bin/env node

/**
 * AUTHENTICATION SYSTEM - COMPREHENSIVE TEST SUITE
 * Provides manual curl commands for testing all endpoints
 */

const baseUrl = "http://localhost:5000/api";

console.log(`
╔════════════════════════════════════════════════════════════════════════════════╗
║                                                                               ║
║            🧪 AUTHENTICATION SYSTEM - COMPREHENSIVE TEST GUIDE               ║
║                                                                               ║
║  This guide shows all curl commands needed to test the auth system.           ║
║  Copy and paste each command into your terminal.                             ║
║                                                                               ║
╚════════════════════════════════════════════════════════════════════════════════╝

MAKE SURE THE SERVER IS RUNNING:
  cd backend
  npm run dev

Then use a NEW terminal for testing. Copy & paste the commands below.

═══════════════════════════════════════════════════════════════════════════════════

TEST 1: REGISTER ORGANIZER USER
────────────────────────────────────────────────────────────────────────────────

curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Sarah Johnson\",\"email\":\"sarah@techconf.com\",\"password\":\"SecurePass123\",\"role\":\"organizer\",\"organizationName\":\"TechConf 2024\",\"phone\":\"+1-555-0100\"}"

Expected: 201 Created with user data and token


TEST 2: REGISTER SPONSOR USER
────────────────────────────────────────────────────────────────────────────────

curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Alex Sponsor\",\"email\":\"alex@brandtech.com\",\"password\":\"SponsorPass456\",\"role\":\"sponsor\",\"organizationName\":\"BrandTech Inc\",\"phone\":\"+1-555-0200\"}"

Expected: 201 Created with user data and token


TEST 3: REGISTER DUPLICATE EMAIL (Should fail)
────────────────────────────────────────────────────────────────────────────────

curl -X POST http://localhost:5000/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Duplicate User\",\"email\":\"sarah@techconf.com\",\"password\":\"AnotherPass789\",\"role\":\"organizer\"}"

Expected: 409 Conflict - "Email already registered"


TEST 4: LOGIN WITH CORRECT CREDENTIALS
────────────────────────────────────────────────────────────────────────────────

curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"sarah@techconf.com\",\"password\":\"SecurePass123\"}"

Expected: 200 OK with user data and token


TEST 5: LOGIN WITH WRONG PASSWORD (Should fail)
────────────────────────────────────────────────────────────────────────────────

curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"sarah@techconf.com\",\"password\":\"WrongPassword\"}"

Expected: 401 Unauthorized - "Invalid email or password"


TEST 6: LOGIN WITH NON-EXISTENT EMAIL (Should fail)
────────────────────────────────────────────────────────────────────────────────

curl -X POST http://localhost:5000/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"nonexistent@example.com\",\"password\":\"AnyPassword\"}"

Expected: 401 Unauthorized - "Invalid email or password"


TEST 7: GET PROFILE WITH VALID TOKEN
────────────────────────────────────────────────────────────────────────────────

curl -X GET http://localhost:5000/api/auth/profile ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTdlYzlmNzcxOTcwOTM4NWJkYTZjNDciLCJlbWFpbCI6InNhcmFoQHRlY2hjb25mLmNvbSIsInJvbGUiOiJvcmdhbml6ZXIiLCJpYXQiOjE3Njk5MTY5MTksImV4cCI6MTc3MDUyMTcxOX0.Ic_kAvU6xtGSBCyIBdh0TGvxiPO2H8A4DKPgLUcBTHc" ^
  -H "Content-Type: application/json"

Replace <TOKEN_FROM_TEST_4> with the token from TEST 4
Expected: 200 OK with user data


TEST 8: GET PROFILE WITHOUT TOKEN (Should fail)
────────────────────────────────────────────────────────────────────────────────

curl -X GET http://localhost:5000/api/auth/profile ^
  -H "Content-Type: application/json"

Expected: 401 Unauthorized - "No token provided"


TEST 9: GET PROFILE WITH INVALID TOKEN (Should fail)
────────────────────────────────────────────────────────────────────────────────

curl -X GET http://localhost:5000/api/auth/profile ^
  -H "Authorization: Bearer invalid.token.here" ^
  -H "Content-Type: application/json"

Expected: 401 Unauthorized - "Invalid token"


TEST 10: GET PROFILE WITH WRONG AUTH FORMAT (Should fail)
────────────────────────────────────────────────────────────────────────────────

curl -X GET http://localhost:5000/api/auth/profile ^
  -H "Authorization: <TOKEN_WITHOUT_BEARER>" ^
  -H "Content-Type: application/json"

Expected: 401 Unauthorized - "No token provided"


TEST 11: TEST EXAMPLE PROTECTED ROUTE
────────────────────────────────────────────────────────────────────────────────

curl -X GET http://localhost:5000/api/examples/protected ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTdlYzlmNzcxOTcwOTM4NWJkYTZjNDciLCJlbWFpbCI6InNhcmFoQHRlY2hjb25mLmNvbSIsInJvbGUiOiJvcmdhbml6ZXIiLCJpYXQiOjE3Njk5MTcyNDUsImV4cCI6MTc3MDUyMjA0NX0.KSrRyDR-UknwSviKfdI5d7ab1ij9Y3-3mBBvWs0NymA" ^
  -H "Content-Type: application/json"

Expected: 200 OK with message "This is a protected route"


TEST 12: ORGANIZER CREATE EVENT (Organizer token)
────────────────────────────────────────────────────────────────────────────────

curl -X POST http://localhost:5000/api/examples/create-event ^
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTdlYzlmNzcxOTcwOTM4NWJkYTZjNDciLCJlbWFpbCI6InNhcmFoQHRlY2hjb25mLmNvbSIsInJvbGUiOiJvcmdhbml6ZXIiLCJpYXQiOjE3Njk5MTcyNDUsImV4cCI6MTc3MDUyMjA0NX0.KSrRyDR-UknwSviKfdI5d7ab1ij9Y3-3mBBvWs0NymA" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Event\"}"

Expected: 200 OK with message "Event created successfully"


TEST 13: SPONSOR ACCESSING ORGANIZER ROUTE (Should fail)
────────────────────────────────────────────────────────────────────────────────

curl -X POST http://localhost:5000/api/examples/create-event ^
  -H "Authorization: Bearer <SPONSOR_TOKEN>" ^
  -H "Content-Type: application/json" ^
  -d "{\"name\":\"Test Event\"}"

Use sponsor token from TEST 2
Expected: 403 Forbidden - "Access denied. Required role(s): organizer"


TEST 14: ADMIN-ONLY ROUTE WITH ORGANIZER TOKEN (Should fail)
────────────────────────────────────────────────────────────────────────────────

curl -X GET http://localhost:5000/api/examples/admin-only ^
  -H "Authorization: Bearer <ORGANIZER_TOKEN>" ^
  -H "Content-Type: application/json"

Expected: 403 Forbidden - "Access denied. Required role(s): admin"


TEST 15: LOGOUT
────────────────────────────────────────────────────────────────────────────────

curl -X POST http://localhost:5000/api/auth/logout ^
  -H "Authorization: Bearer <TOKEN_FROM_TEST_4>" ^
  -H "Content-Type: application/json"

Expected: 200 OK with message "Logout successful"


TEST 16: USE TOKEN AFTER LOGOUT (Still works - stateless)
────────────────────────────────────────────────────────────────────────────────

curl -X GET http://localhost:5000/api/auth/profile ^
  -H "Authorization: Bearer <TOKEN_FROM_TEST_4>" ^
  -H "Content-Type: application/json"

Expected: 200 OK (Token is still valid - stateless logout)


═══════════════════════════════════════════════════════════════════════════════════

QUICK START TESTING:

1. Open two terminals in the backend folder:

   Terminal 1:
   npm run dev

   Terminal 2:
   (paste commands from above)

2. Each test command shows the expected response. Compare your results.

3. All 16 tests should complete successfully. ✅


═══════════════════════════════════════════════════════════════════════════════════

EXPECTED SUCCESS CRITERIA:

✅ Test 1: 201 Created (register organizer)
✅ Test 2: 201 Created (register sponsor)
✅ Test 3: 409 Conflict (duplicate email)
✅ Test 4: 200 OK (correct login)
✅ Test 5: 401 Unauthorized (wrong password)
✅ Test 6: 401 Unauthorized (non-existent email)
✅ Test 7: 200 OK (profile with token)
✅ Test 8: 401 Unauthorized (no token)
✅ Test 9: 401 Unauthorized (invalid token)
✅ Test 10: 401 Unauthorized (wrong format)
✅ Test 11: 200 OK (protected route)
✅ Test 12: 200 OK (organizer can create)
✅ Test 13: 403 Forbidden (sponsor denied)
✅ Test 14: 403 Forbidden (non-admin denied)
✅ Test 15: 200 OK (logout)
✅ Test 16: 200 OK (token still valid after logout)

═══════════════════════════════════════════════════════════════════════════════════

If all tests pass: ✨ AUTHENTICATION SYSTEM IS FULLY WORKING! ✨

═══════════════════════════════════════════════════════════════════════════════════
`);
