# PowerShell script to test password verification
# Usage: .\scripts\test-password.ps1 <password> <hash>

param(
    [Parameter(Mandatory=$true)]
    [string]$Password,
    
    [Parameter(Mandatory=$true)]
    [string]$Hash
)

Write-Host "`nTesting password verification:" -ForegroundColor Cyan
Write-Host "Password: $Password"
Write-Host "Hash: $Hash"
Write-Host "Hash length: $($Hash.Length)"
Write-Host "`nVerifying..." -ForegroundColor Yellow

$bcrypt = require('bcryptjs')
$isValid = $bcrypt.compareSync($Password, $Hash)

if ($isValid) {
    Write-Host "Result: ✓ VALID" -ForegroundColor Green
} else {
    Write-Host "Result: ✗ INVALID" -ForegroundColor Red
    Write-Host "`nThe password does not match the hash." -ForegroundColor Yellow
    Write-Host "Make sure you are using the correct password that was used to generate the hash." -ForegroundColor Yellow
}

