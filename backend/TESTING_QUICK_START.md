# 🧪 AUTHENTICATION TESTING - QUICK START

## Start the Server

```bash
cd backend
npm run dev
```

Expected output:
```
🚀 Server is running on port 5000
Environment: development
📍 API URL: http://localhost:5000/api
```

## View All Test Commands

In a **NEW terminal** (keep the first one running):

```bash
node backend/TEST_GUIDE.js
```

This will display all 16 test commands with expected responses.

## Quick Manual Tests (Copy & Paste)

Open a new terminal and run these curl commands:

### TEST 1: Register Organizer

```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Sarah Johnson\",\"email\":\"sarah@techconf.com\",\"password\":\"SecurePass123\",\"role\":\"organizer\",\"organizationName\":\"TechConf 2024\"}"
```

Expected: **201 Created** with token

---

### TEST 2: Register Sponsor

```bash
curl -X POST http://localhost:5000/api/auth/register -H "Content-Type: application/json" -d "{\"name\":\"Alex Sponsor\",\"email\":\"alex@brandtech.com\",\"password\":\"SponsorPass456\",\"role\":\"sponsor\",\"organizationName\":\"BrandTech Inc\"}"
```

Expected: **201 Created** with token

---

### TEST 3: Login

```bash
curl -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"sarah@techconf.com\",\"password\":\"SecurePass123\"}"
```

Expected: **200 OK** with token

**Save the token from this response, you'll need it for next tests.**

---

### TEST 4: Get Profile (with token from TEST 3)

Replace `<TOKEN>` with the token from TEST 3:

```bash
curl -X GET http://localhost:5000/api/auth/profile -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json"
```

Expected: **200 OK** with user data

---

### TEST 5: Get Profile Without Token (Should fail)

```bash
curl -X GET http://localhost:5000/api/auth/profile -H "Content-Type: application/json"
```

Expected: **401 Unauthorized**

---

### TEST 6: Test Protected Route (with token)

```bash
curl -X GET http://localhost:5000/api/examples/protected -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json"
```

Expected: **200 OK**

---

### TEST 7: Organizer Creating Event (with organizer token)

```bash
curl -X POST http://localhost:5000/api/examples/create-event -H "Authorization: Bearer <TOKEN>" -H "Content-Type: application/json" -d "{\"name\":\"Test Event\"}"
```

Expected: **200 OK**

---

### TEST 8: Sponsor Trying Organizer Route (Should fail)

Use sponsor token from TEST 2:

```bash
curl -X POST http://localhost:5000/api/examples/create-event -H "Authorization: Bearer <SPONSOR_TOKEN>" -H "Content-Type: application/json" -d "{\"name\":\"Test\"}"
```

Expected: **403 Forbidden**

---

## What Each Test Verifies

| # | Test | Verifies |
|---|------|----------|
| 1 | Register Organizer | User creation, password hashing, role assignment |
| 2 | Register Sponsor | Different role support, registration flow |
| 3 | Login | Password verification, token generation |
| 4 | Get Profile | Token verification, auth middleware |
| 5 | No Token (fail) | Authentication requirement enforcement |
| 6 | Protected Route | Basic protection working |
| 7 | Organizer Route | Role-based access for organizers |
| 8 | Sponsor Denied | Role restriction enforcement (403) |

---

## ✅ Success Criteria

All tests should show:

- ✅ Status codes match expected values
- ✅ Tokens are generated (JWT format)
- ✅ User data returned without passwords
- ✅ Role-based access control working
- ✅ Errors return proper status codes (401, 403, etc.)
- ✅ No TypeScript errors in server
- ✅ Server stays running (no crashes)

---

## 🎉 When All Tests Pass

The authentication system is **FULLY WORKING** and ready for:

✅ Building domain routes (events, sponsorships, etc.)  
✅ Integration with frontend  
✅ Production deployment  
✅ Adding more features on top  

---

## Files for Reference

- **TEST_GUIDE.js** - All test commands in one place
- **TESTING_DOCUMENTATION.ts** - Detailed testing guide
- **test-auth.ps1** - Automated PowerShell test script
- **ROUTE_PATTERNS.md** - Examples for building your routes
- **IMPLEMENTATION_CHECKLIST.md** - Production deployment guide

---

**Need help?** Check `IMPLEMENTATION_CHECKLIST.md` for troubleshooting.
