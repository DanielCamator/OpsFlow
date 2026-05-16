# ── Build stage ─────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copiar la solución
COPY OpsFlow.slnx ./

# Copiar todos los proyectos
COPY OpsFlow.Api/ ./OpsFlow.Api/
COPY OpsFlow.Tests/ ./OpsFlow.Tests/

# Restaurar dependencias
RUN dotnet restore OpsFlow.slnx

# Compilar y publicar
RUN dotnet publish OpsFlow.Api/OpsFlow.Api.csproj -c Release -o /app/publish

# ── Runtime stage ────────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app

COPY --from=build /app/publish .

EXPOSE 5000
ENTRYPOINT ["dotnet", "OpsFlow.Api.dll"]