using HealthcareAPI.Models;
using HealthcareAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;



namespace HealthcareAPI.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class ChatController : ControllerBase
    {
        private readonly IBedrockService _bedrockService;
        private readonly ILogger<ChatController> _logger;

        public ChatController(IBedrockService bedrockService, ILogger<ChatController> logger)
        {

            _bedrockService = bedrockService;
            _logger = logger;
        }

        /// <summary>
        /// Ask a question to the Healthcare AI assistant 
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [HttpPost]
        [ProducesResponseType(typeof(ChatResponse), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status500InternalServerError)]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Question))
                return BadRequest(new { error = "Question is required" });

            _logger.LogInformation("Chat request received: {Question}", request.Question);

            var response = await _bedrockService.AskAsync(request.Question);
            return Ok(response);
        }

        /// <summary>
        /// Health check endpoint
        /// </summary>
        /// <returns></returns>
        [HttpGet("health")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public IActionResult Health()
        {
            return Ok(new
            {
                status = "Healthy",
                service = "HealthCare AI API",
                timestamp = DateTime.UtcNow
            });
        }
    }
}
