# Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Restore first, so a code-only change does not re-download every package.
COPY Directory.Build.props FitCore.sln ./
COPY src/FitCore.Domain/FitCore.Domain.csproj src/FitCore.Domain/
COPY src/FitCore.Application/FitCore.Application.csproj src/FitCore.Application/
COPY src/FitCore.Infrastructure/FitCore.Infrastructure.csproj src/FitCore.Infrastructure/
COPY src/FitCore.Api/FitCore.Api.csproj src/FitCore.Api/
COPY tests/FitCore.Application.Tests/FitCore.Application.Tests.csproj tests/FitCore.Application.Tests/
RUN dotnet restore FitCore.sln

COPY . .
RUN dotnet test tests/FitCore.Application.Tests/FitCore.Application.Tests.csproj -c Release --no-restore
RUN dotnet publish src/FitCore.Api/FitCore.Api.csproj -c Release -o /app --no-restore

# Run
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app
COPY --from=build /app .

# The API holds the Firebase admin credentials, so it never runs as root.
RUN adduser --disabled-password --gecos "" --uid 10001 fitcore && chown -R fitcore /app
USER fitcore

ENV ASPNETCORE_URLS=http://+:8080 \
    ASPNETCORE_ENVIRONMENT=Production \
    DOTNET_SYSTEM_GLOBALIZATION_INVARIANT=false
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s \
  CMD ["dotnet", "--info"]

ENTRYPOINT ["dotnet", "FitCore.Api.dll"]
