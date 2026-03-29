$frontendPath = "d:\salaar-mvp\salaar_mvp\salaar_mvp\frontend"

Write-Host "Starting frontend..."
Start-Process powershell -ArgumentList "-NoExit -Command `"cd $frontendPath; npm install; npm run dev`""
