using Microsoft.EntityFrameworkCore;
using OpsFlow.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// PostgreSQL — connection string from env / appsettings
var connectionString = builder.Configuration.GetConnectionString("Default");
builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseNpgsql(connectionString));

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseCors("AllowAll");

// Configure the HTTP request pipeline.

// Health check
app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

// Hello endpoint
app.MapGet("/api/hello", () => Results.Ok(new { message = "Hello User from the backend" }));

app.Run();