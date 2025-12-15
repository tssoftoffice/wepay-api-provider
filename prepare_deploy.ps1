$exclusionList = @(
    "node_modules",
    ".next",
    ".git",
    ".env",
    "*.zip",
    ".vscode",
    ".idea"
)

$source = "c:\Users\USER\Desktop\Work Life No Balance\AI Project\wepay-api-provider"
$destination = "c:\Users\USER\Desktop\Work Life No Balance\AI Project\wepay-api-provider\deploy_package.zip"

if (Test-Path $destination) {
    Remove-Item $destination
}

# Get items directly to filter
$items = Get-ChildItem -Path $source | Where-Object { $_.Name -notin $exclusionList }

Compress-Archive -Path $items.FullName -DestinationPath $destination

Write-Host "Deployment package created at: $destination"
