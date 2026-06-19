using Amazon.BedrockAgentRuntime;
using Amazon.BedrockAgentRuntime.Model;
using Amazon.BedrockRuntime;
using Amazon.BedrockRuntime.Model;
using HealthcareAPI.Models;
using HealthcareAPI.Services.Interfaces;
using System.Text.Json;

namespace HealthcareAPI.Services;

public class BedrockService : IBedrockService
{
    private readonly IAmazonBedrockAgentRuntime _bedrockAgent;
    private readonly IAmazonBedrockRuntime _bedrockRuntime;
    private readonly ILogger<BedrockService> _logger;
    private readonly IConfiguration _configuration;

    private const string ModelId = "amazon.nova-lite-v1:0";

    public BedrockService(
        IAmazonBedrockAgentRuntime bedrockAgent,
        IAmazonBedrockRuntime bedrockRuntime,
        ILogger<BedrockService> logger,
        IConfiguration configuration)
    {
        _bedrockAgent = bedrockAgent;
        _bedrockRuntime = bedrockRuntime;
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<ChatResponse> AskAsync(string question)
    {
        try
        {
            var knowledgeBaseId = _configuration["Bedrock:KnowledgeBaseId"]
                ?? throw new InvalidOperationException("KnowledgeBaseId not configured");

            var providerName = _configuration["App:ProviderName"]
                ?? "your pathology provider";
            var contactPhone = _configuration["App:ContactPhone"]
                ?? "your pathology provider";
            var contactName = _configuration["App:ContactName"]
                ?? "our team";

            // Step 1 — Retrieve from Knowledge Base
            var retrieveRequest = new RetrieveRequest
            {
                KnowledgeBaseId = knowledgeBaseId,
                RetrievalQuery = new KnowledgeBaseQuery
                {
                    Text = question
                }
            };

            _logger.LogInformation("Retrieving from Knowledge Base {KbId}", knowledgeBaseId);

            var retrieveResponse = await _bedrockAgent.RetrieveAsync(retrieveRequest);

            var contextText = string.Empty;
            var sources = new List<string>();

            foreach (var result in retrieveResponse.RetrievalResults)
            {
                contextText += result.Content.Text + "\n\n";
                var uri = result.Location?.S3Location?.Uri;
                if (!string.IsNullOrEmpty(uri) && !sources.Contains(uri))
                    sources.Add(uri);
            }

            _logger.LogInformation("Retrieved {Count} results",
                retrieveResponse.RetrievalResults.Count);

            // Step 2 — Generate answer
            var prompt = $"""
                You are a helpful healthcare assistant for a pathology and diagnostic services provider.

                Answer the following question using ONLY the information provided below.
                If the answer is not in the provided information, say "I don't have that information available. Please contact {contactName} directly on {contactPhone}."
                Never make up information. Never provide medical advice or interpret test results.

                Information:
                {contextText}

                Question: {question}

                Answer:
                """;

            var requestBody = JsonSerializer.Serialize(new
            {
                messages = new[]
                {
                    new
                    {
                        role = "user",
                        content = new[]
                        {
                            new { text = prompt }
                        }
                    }
                },
                inferenceConfig = new
                {
                    maxTokens = 512,
                    temperature = 0.1
                }
            });

            var invokeRequest = new InvokeModelRequest
            {
                ModelId = ModelId,
                ContentType = "application/json",
                Accept = "application/json",
                Body = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(requestBody))
            };

            _logger.LogInformation("Invoking Nova Lite model");

            var invokeResponse = await _bedrockRuntime.InvokeModelAsync(invokeRequest);

            var responseJson = await new StreamReader(invokeResponse.Body).ReadToEndAsync();
            var responseDoc = JsonDocument.Parse(responseJson);
            var answer = responseDoc
                .RootElement
                .GetProperty("output")
                .GetProperty("message")
                .GetProperty("content")[0]
                .GetProperty("text")
                .GetString() ?? "No answer available.";

            _logger.LogInformation("Successfully generated answer");

            return new ChatResponse
            {
                Answer = answer,
                Sources = sources
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling Bedrock for question: {Question}", question);
            throw;
        }
    }
}