$services = @(
    "core-api",
    "chat-service",
    "agent-service",
    "memory-service",
    "research-service",
    "workspace-service"
)

# Shared dependencies path
$servicesPath = "d:\salaar-mvp\salaar_mvp\salaar_mvp\services"

Write-Host "Installing root dependencies..."
npm install

foreach ($svc in $services) {
    $svcDir = Join-Path $servicesPath $svc
    if (Test-Path (Join-Path $svcDir "src\index.ts")) {
        Write-Host "Starting $svc ..."
        
        # Start the service in a new window
        # First installs dependencies for that service, then runs it
        Start-Process powershell -ArgumentList "-NoExit -Command `"cd $svcDir; npm install; npx ts-node src/index.ts`""
    } else {
        Write-Host "Skipping $svc - no src/index.ts found."
    }
}

Write-Host "All backend services started."
