# OBSOLETE: This script is no longer used.
# 
# ShiftAware now uses simplified auth per plan:
# - Plain ADMIN_PASSWORD env variable (no hashing)
# - Direct string comparison
# 
# This script is kept for reference only and will be removed in a future cleanup.

Write-Warning "This script is OBSOLETE."
Write-Warning "ShiftAware uses simplified auth: plain ADMIN_PASSWORD env variable."
Write-Warning "No password hash verification needed."
exit 1
