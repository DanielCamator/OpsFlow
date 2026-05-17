using Microsoft.EntityFrameworkCore;
using OpsFlow.Infrastructure.Data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddDbContext<OpsFlowDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseCors("AllowAll");

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.MapGet("/api/hello", () => Results.Ok(new { message = "Hello User from the backend" }));

app.Run();