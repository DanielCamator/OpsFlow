using Microsoft.EntityFrameworkCore;
using OpsFlow.Infrastructure.Data;
using System.Text.Json.Serialization;

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

builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<OpsFlowDbContext>();
    DbInitializer.Initialize(context);
}

app.UseCors("AllowAll");

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.MapGet("/api/hello", () => Results.Ok(new { message = "Hello User from the backend" }));

app.Run();