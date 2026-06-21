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
            var modelId = _configuration["Bedrock:ModelId"]
                ?? throw new InvalidOperationException("ModelId not configured");
            var knowledgeBaseId = _configuration["Bedrock:KnowledgeBaseId"]
                ?? throw new InvalidOperationException("KnowledgeBaseId not configured");
            var guardrailId = _configuration["Bedrock:GuardrailId"];
            var guardrailVersion = _configuration["Bedrock:GuardrailVersion"];

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
                ModelId = modelId,
                
                ContentType = "application/json",
                Accept = "application/json",
                Body = new MemoryStream(System.Text.Encoding.UTF8.GetBytes(requestBody))
            };


            // Only apply guardrail if configured
            if (!string.IsNullOrEmpty(guardrailId) && !string.IsNullOrEmpty(guardrailVersion))
            {
                invokeRequest.GuardrailIdentifier = guardrailId;
                invokeRequest.GuardrailVersion = guardrailVersion;
            }
            _logger.LogInformation("Invoking Nova Lite model");

            var invokeResponse = await _bedrockRuntime.InvokeModelAsync(invokeRequest);

            var responseJson = await new StreamReader(invokeResponse.Body).ReadToEndAsync();
            var responseDoc = JsonDocument.Parse(responseJson);

            // Check if guardrail intervened
            if (responseDoc.RootElement.TryGetProperty("stopReason", out var stopReasonEl))
            {
                var stopReason = stopReasonEl.GetString();
                if (stopReason == "guardrail_intervened")
                {
                    _logger.LogWarning("Guardrail intervened for question: {Question}", question);
                    return new ChatResponse
                    {
                        Answer = "I can only answer questions about pathology and healthcare services. Please ask me about tests, appointments, preparation, or results.",
                        Sources = new List<string>()
                    };
                }
            }

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