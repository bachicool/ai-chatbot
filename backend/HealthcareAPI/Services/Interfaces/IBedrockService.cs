using HealthcareAPI.Models;
namespace HealthcareAPI.Services.Interfaces
{
    public interface IBedrockService
    {
        Task<ChatResponse> AskAsync(string question);
    }
}
