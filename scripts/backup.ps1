param(
  [string]$MongoUri = $env:MONGODB_URI,
  [string]$OutputDirectory = "backups\ankita-portfolio-$(Get-Date -Format yyyyMMdd-HHmmss)"
)

if ([string]::IsNullOrWhiteSpace($MongoUri)) {
  Write-Error "MONGODB_URI is required."
  exit 1
}

New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
mongodump --uri $MongoUri --out $OutputDirectory
if ($LASTEXITCODE -ne 0) {
  Write-Error "mongodump failed."
  exit $LASTEXITCODE
}

Write-Output "Backup written to $OutputDirectory"
