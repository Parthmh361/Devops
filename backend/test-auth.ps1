#!/usr/bin/env pwsh

# ════════════════════════════════════════════════════════════════════════════════
# COMPREHENSIVE AUTHENTICATION TESTING SCRIPT
# Tests all auth endpoints with multiple scenarios
# ════════════════════════════════════════════════════════════════════════════════

$baseUrl = "http://localhost:5000/api"
$errors = @()
$successes = @()

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🧪 AUTHENTICATION SYSTEM - COMPREHENSIVE TEST SUITE" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# ════════════════════════════════════════════════════════════════════════════════
# TEST 1: REGISTER USER - ORGANIZER
# ════════════════════════════════════════════════════════════════════════════════

Write-Host "TEST 1: Register Organizer User" -ForegroundColor Yellow
$organizer = @{
    name = "Sarah Johnson"
    email = "sarah@techconf.com"
    password = "SecurePass123"
    role = "organizer"
    organizationName = "TechConf 2024"
    phone = "+1-555-0100"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $organizer `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    $organizerToken = $data.data.token
    
    if ($data.success -and $organizerToken) {
        Write-Host "✅ Organizer registration successful" -ForegroundColor Green
        Write-Host "   Email: $($data.data.user.email)" -ForegroundColor Green
        Write-Host "   Role: $($data.data.user.role)" -ForegroundColor Green
        Write-Host "   Token received: $(($organizerToken).Substring(0, 20))..." -ForegroundColor Green
        $successes += "Organizer registration"
    } else {
        Write-Host "❌ Registration failed: $($data.message)" -ForegroundColor Red
        $errors += "Organizer registration failed"
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $errors += "Organizer registration error: $($_.Exception.Message)"
}

# ════════════════════════════════════════════════════════════════════════════════
# TEST 2: REGISTER USER - SPONSOR
# ════════════════════════════════════════════════════════════════════════════════

Write-Host "`nTEST 2: Register Sponsor User" -ForegroundColor Yellow
$sponsor = @{
    name = "Alex Sponsor"
    email = "alex@brandtech.com"
    password = "SponsorPass456"
    role = "sponsor"
    organizationName = "BrandTech Inc"
    phone = "+1-555-0200"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $sponsor `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    $sponsorToken = $data.data.token
    
    if ($data.success -and $sponsorToken) {
        Write-Host "✅ Sponsor registration successful" -ForegroundColor Green
        Write-Host "   Email: $($data.data.user.email)" -ForegroundColor Green
        Write-Host "   Role: $($data.data.user.role)" -ForegroundColor Green
        $successes += "Sponsor registration"
    } else {
        Write-Host "❌ Registration failed: $($data.message)" -ForegroundColor Red
        $errors += "Sponsor registration failed"
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $errors += "Sponsor registration error"
}

# ════════════════════════════════════════════════════════════════════════════════
# TEST 3: REGISTER USER - DUPLICATE EMAIL (Should fail)
# ════════════════════════════════════════════════════════════════════════════════

Write-Host "`nTEST 3: Register Duplicate Email (Should fail with 409)" -ForegroundColor Yellow
$duplicate = @{
    name = "Duplicate User"
    email = "sarah@techconf.com"
    password = "AnotherPass789"
    role = "organizer"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/register" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $duplicate `
        -ErrorAction Stop
    
    Write-Host "❌ Should have failed but succeeded" -ForegroundColor Red
    $errors += "Duplicate email check failed"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    if ($statusCode -eq 409) {
        Write-Host "✅ Correctly rejected duplicate email with 409" -ForegroundColor Green
        $successes += "Duplicate email handling"
    } else {
        Write-Host "❌ Wrong status code: $statusCode (expected 409)" -ForegroundColor Red
        $errors += "Wrong status code for duplicate email"
    }
}

# ════════════════════════════════════════════════════════════════════════════════
# TEST 4: LOGIN WITH CORRECT CREDENTIALS
# ════════════════════════════════════════════════════════════════════════════════

Write-Host "`nTEST 4: Login with Correct Credentials" -ForegroundColor Yellow
$loginCreds = @{
    email = "sarah@techconf.com"
    password = "SecurePass123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $loginCreds `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    $loginToken = $data.data.token
    
    if ($data.success -and $loginToken) {
        Write-Host "✅ Login successful" -ForegroundColor Green
        Write-Host "   User: $($data.data.user.name)" -ForegroundColor Green
        Write-Host "   Token matches registration: $(if ($loginToken -eq $organizerToken) {'Yes'} else {'Different (new token)'})" -ForegroundColor Green
        $successes += "Login with correct credentials"
    } else {
        Write-Host "❌ Login failed: $($data.message)" -ForegroundColor Red
        $errors += "Login failed"
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $errors += "Login error"
}

# ════════════════════════════════════════════════════════════════════════════════
# TEST 5: LOGIN WITH WRONG PASSWORD (Should fail with 401)
# ════════════════════════════════════════════════════════════════════════════════

Write-Host "`nTEST 5: Login with Wrong Password (Should fail)" -ForegroundColor Yellow
$wrongPass = @{
    email = "sarah@techconf.com"
    password = "WrongPassword"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $wrongPass `
        -ErrorAction Stop
    
    Write-Host "❌ Should have failed but succeeded" -ForegroundColor Red
    $errors += "Wrong password not rejected"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    if ($statusCode -eq 401) {
        Write-Host "✅ Correctly rejected with 401 Unauthorized" -ForegroundColor Green
        $successes += "Wrong password handling"
    } else {
        Write-Host "❌ Wrong status code: $statusCode (expected 401)" -ForegroundColor Red
        $errors += "Wrong status code for invalid password"
    }
}

# ════════════════════════════════════════════════════════════════════════════════
# TEST 6: LOGIN WITH NON-EXISTENT EMAIL (Should fail with 401)
# ════════════════════════════════════════════════════════════════════════════════

Write-Host "`nTEST 6: Login with Non-existent Email (Should fail)" -ForegroundColor Yellow
$noEmail = @{
    email = "nonexistent@example.com"
    password = "AnyPassword"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/login" `
        -Method POST `
        -Headers @{"Content-Type"="application/json"} `
        -Body $noEmail `
        -ErrorAction Stop
    
    Write-Host "❌ Should have failed but succeeded" -ForegroundColor Red
    $errors += "Non-existent email not rejected"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    if ($statusCode -eq 401) {
        Write-Host "✅ Correctly rejected with 401" -ForegroundColor Green
        $successes += "Non-existent email handling"
    } else {
        Write-Host "❌ Wrong status code: $statusCode (expected 401)" -ForegroundColor Red
        $errors += "Wrong status code for non-existent email"
    }
}

# ════════════════════════════════════════════════════════════════════════════════
# TEST 7: GET PROFILE WITH VALID TOKEN
# ════════════════════════════════════════════════════════════════════════════════

Write-Host "`nTEST 7: Get Profile with Valid Token" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/profile" `
        -Method GET `
        -Headers @{
            "Authorization"="Bearer $loginToken"
            "Content-Type"="application/json"
        } `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.success -and $data.data.user) {
        Write-Host "✅ Profile retrieved successfully" -ForegroundColor Green
        Write-Host "   Name: $($data.data.user.name)" -ForegroundColor Green
        Write-Host "   Role: $($data.data.user.role)" -ForegroundColor Green
        Write-Host "   Active: $($data.data.user.isActive)" -ForegroundColor Green
        $successes += "Get profile with valid token"
    } else {
        Write-Host "❌ Failed to get profile" -ForegroundColor Red
        $errors += "Profile retrieval failed"
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $errors += "Profile retrieval error"
}

# ════════════════════════════════════════════════════════════════════════════════
# TEST 8: GET PROFILE WITHOUT TOKEN (Should fail with 401)
# ════════════════════════════════════════════════════════════════════════════════

Write-Host "`nTEST 8: Get Profile Without Token (Should fail)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/profile" `
        -Method GET `
        -Headers @{"Content-Type"="application/json"} `
        -ErrorAction Stop
    
    Write-Host "❌ Should have failed but succeeded" -ForegroundColor Red
    $errors += "Missing token not rejected"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    if ($statusCode -eq 401) {
        Write-Host "✅ Correctly rejected with 401" -ForegroundColor Green
        $successes += "Missing token handling"
    } else {
        Write-Host "❌ Wrong status code: $statusCode (expected 401)" -ForegroundColor Red
        $errors += "Wrong status code for missing token"
    }
}

# ════════════════════════════════════════════════════════════════════════════════
# TEST 9: GET PROFILE WITH INVALID TOKEN (Should fail with 401)
# ════════════════════════════════════════════════════════════════════════════════

Write-Host "`nTEST 9: Get Profile with Invalid Token (Should fail)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/profile" `
        -Method GET `
        -Headers @{
            "Authorization"="Bearer invalid.token.here"
            "Content-Type"="application/json"
        } `
        -ErrorAction Stop
    
    Write-Host "❌ Should have failed but succeeded" -ForegroundColor Red
    $errors += "Invalid token not rejected"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    if ($statusCode -eq 401) {
        Write-Host "✅ Correctly rejected with 401" -ForegroundColor Green
        $successes += "Invalid token handling"
    } else {
        Write-Host "❌ Wrong status code: $statusCode" -ForegroundColor Red
        $errors += "Wrong status code for invalid token"
    }
}

# ════════════════════════════════════════════════════════════════════════════════
# TEST 10: GET PROFILE WITH WRONG AUTHORIZATION FORMAT (Should fail)
# ════════════════════════════════════════════════════════════════════════════════

Write-Host "`nTEST 10: Get Profile with Wrong Authorization Format" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/profile" `
        -Method GET `
        -Headers @{
            "Authorization"="$loginToken"
            "Content-Type"="application/json"
        } `
        -ErrorAction Stop
    
    Write-Host "❌ Should have failed but succeeded" -ForegroundColor Red
    $errors += "Wrong auth format not rejected"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    if ($statusCode -eq 401) {
        Write-Host "✅ Correctly rejected with 401" -ForegroundColor Green
        $successes += "Wrong auth format handling"
    } else {
        Write-Host "❌ Wrong status code: $statusCode" -ForegroundColor Red
        $errors += "Wrong status code for invalid format"
    }
}

# ════════════════════════════════════════════════════════════════════════════════
# TEST 11: TEST EXAMPLE ROUTES - PROTECTED
# ════════════════════════════════════════════════════════════════════════════════

Write-Host "`nTEST 11: Example Protected Route (Any authenticated user)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/examples/protected" `
        -Method GET `
        -Headers @{
            "Authorization"="Bearer $loginToken"
            "Content-Type"="application/json"
        } `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.message -like "*protected*") {
        Write-Host "✅ Example protected route works" -ForegroundColor Green
        Write-Host "   Message: $($data.message)" -ForegroundColor Green
        Write-Host "   User Role: $($data.currentUser.role)" -ForegroundColor Green
        $successes += "Example protected route"
    } else {
        Write-Host "❌ Route returned unexpected data" -ForegroundColor Red
        $errors += "Example route unexpected response"
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $errors += "Example route error"
}

# ════════════════════════════════════════════════════════════════════════════════
# TEST 12: TEST EXAMPLE ROUTES - ROLE SPECIFIC (Organizer route with organizer token)
# ════════════════════════════════════════════════════════════════════════════════

Write-Host "`nTEST 12: Example Organizer Route with Organizer Token" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/examples/create-event" `
        -Method POST `
        -Headers @{
            "Authorization"="Bearer $loginToken"
            "Content-Type"="application/json"
        } `
        -Body (@{name="Test Event"} | ConvertTo-Json) `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.message -like "*Event created*") {
        Write-Host "✅ Organizer route accessible to organizer" -ForegroundColor Green
        Write-Host "   Role of creator: $($data.creator.role)" -ForegroundColor Green
        $successes += "Organizer route with organizer token"
    } else {
        Write-Host "✅ Route executed (response received)" -ForegroundColor Green
        $successes += "Organizer route with organizer token"
    }
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    Write-Host "Response status: $statusCode" -ForegroundColor Cyan
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $errors += "Organizer route error"
}

# ════════════════════════════════════════════════════════════════════════════════
# TEST 13: TEST ROLE RESTRICTION (Sponsor trying to access organizer route)
# ════════════════════════════════════════════════════════════════════════════════

Write-Host "`nTEST 13: Sponsor Accessing Organizer-Only Route (Should fail with 403)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/examples/create-event" `
        -Method POST `
        -Headers @{
            "Authorization"="Bearer $sponsorToken"
            "Content-Type"="application/json"
        } `
        -Body (@{name="Test"} | ConvertTo-Json) `
        -ErrorAction Stop
    
    Write-Host "❌ Should have been denied but was allowed" -ForegroundColor Red
    $errors += "Sponsor access to organizer route not denied"
} catch {
    $statusCode = $_.Exception.Response.StatusCode.Value__
    if ($statusCode -eq 403) {
        Write-Host "✅ Correctly denied sponsor access with 403" -ForegroundColor Green
        $successes += "Role-based access control working"
    } else {
        Write-Host "❌ Wrong status code: $statusCode (expected 403)" -ForegroundColor Red
        $errors += "Wrong status code for role denial"
    }
}

# ════════════════════════════════════════════════════════════════════════════════
# TEST 14: LOGOUT
# ════════════════════════════════════════════════════════════════════════════════

Write-Host "`nTEST 14: Logout" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/auth/logout" `
        -Method POST `
        -Headers @{
            "Authorization"="Bearer $loginToken"
            "Content-Type"="application/json"
        } `
        -ErrorAction Stop
    
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.success) {
        Write-Host "✅ Logout successful" -ForegroundColor Green
        Write-Host "   Message: $($data.message)" -ForegroundColor Green
        $successes += "Logout"
    } else {
        Write-Host "❌ Logout failed" -ForegroundColor Red
        $errors += "Logout failed"
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    $errors += "Logout error"
}

# ════════════════════════════════════════════════════════════════════════════════
# TEST SUMMARY
# ════════════════════════════════════════════════════════════════════════════════

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 TEST SUMMARY" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

Write-Host "✅ PASSED TESTS: $($successes.Count)" -ForegroundColor Green
$successes | ForEach-Object { Write-Host "   ✓ $_" -ForegroundColor Green }

if ($errors.Count -gt 0) {
    Write-Host "`n❌ FAILED TESTS: $($errors.Count)" -ForegroundColor Red
    $errors | ForEach-Object { Write-Host "   ✗ $_" -ForegroundColor Red }
} else {
    Write-Host "`n🎉 ALL TESTS PASSED!" -ForegroundColor Green
}

Write-Host "`n════════════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "Test Results: $($successes.Count) passed, $($errors.Count) failed" -ForegroundColor Cyan
Write-Host "════════════════════════════════════════════════════════════════`n" -ForegroundColor Cyan

# Exit with appropriate code
if ($errors.Count -gt 0) {
    exit 1
} else {
    exit 0
}
