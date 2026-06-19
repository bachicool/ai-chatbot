using Amazon.BedrockAgentRuntime;
using Amazon.BedrockRuntime;
using HealthcareAPI.Services;
using HealthcareAPI.Services.Interfaces;
using Swashbuckle.AspNetCore.SwaggerUI;



var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// OpenAPI/Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "Healthcare AI API",
        Version = "v1",
        Description = "AI-powered healthcare assistant for Pathology company"
    });
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
        c.IncludeXmlComments(xmlPath);
});

// AWS Bedrock clients
builder.Services.AddSingleton<IAmazonBedrockAgentRuntime>(_ =>
    new AmazonBedrockAgentRuntimeClient(Amazon.RegionEndpoint.APSoutheast2));

builder.Services.AddSingleton<IAmazonBedrockRuntime>(_ =>
    new AmazonBedrockRuntimeClient(Amazon.RegionEndpoint.APSoutheast2));

// Register services using interface (Dependency Inversion)
builder.Services.AddScoped<IBedrockService, BedrockService>();

// CORS — allow React app
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReact", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:3000",
                "https://chat.pavcloud.click")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

var app = builder.Build();

// Swagger UI
// Swagger UI
//if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

}

app.UseCors("AllowReact");
app.UseAuthorization();
app.MapControllers();

app.Run();