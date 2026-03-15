#!/usr/bin/env pwsh
# Script to generate SQL and seed the database via Docker
# Usage: .\scripts\seed-db-docker.ps1

# Step 1: Generate SQL from JSON files
Write-Host "📋 Generating SQL seed script from JSON files..." -ForegroundColor Cyan
npx ts-node scripts/generate-seed-sql.ts

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to generate SQL script" -ForegroundColor Red
    exit 1
}

# Step 2: Execute SQL via Docker
Write-Host "`n🐘 Executing SQL script via Docker..." -ForegroundColor Cyan

$postgresContainer = "license-mgmt-postgres"
$dbName = "license_mgmt"
$dbUser = "postgres"

# Check if container exists
$containerExists = docker ps -a --filter "name=$postgresContainer" --format "table {{.Names}}" | Select-String $postgresContainer

if (-not $containerExists) {
    Write-Host "❌ PostgreSQL container '$postgresContainer' not found" -ForegroundColor Red
    Write-Host "Available containers:" -ForegroundColor Yellow
    docker ps -a --format "table {{.Names}}\t{{.Status}}"
    exit 1
}

# Execute the SQL file
docker exec -i $postgresContainer psql -U $dbUser -d $dbName < scripts/seed-db.sql

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Database seeding completed successfully!" -ForegroundColor Green
    Write-Host "`n📊 Verifying seeded data..." -ForegroundColor Cyan
    docker exec $postgresContainer psql -U $dbUser -d $dbName -c "SELECT COUNT(*) as users_count FROM users;" -c "SELECT COUNT(*) as licenses_count FROM licenses;"
} else {
    Write-Host "`n❌ Database seeding failed" -ForegroundColor Red
    exit 1
}
