/**
 * @typedef {Object} CompletionResponse
 * @property {string} id - The ID of the completion.
 * @property {string} object - The type of object.
 * @property {number} created - The timestamp of when the completion was created.
 * @property {string} model - The model used for the completion.
 * @property {string} system_fingerprint - The system fingerprint.
 * @property {Array.<CompletionChoice>} choices - The completion choices.
 * @property {CompletionUsage} usage - The usage information.
 */

/**
 * @typedef {Object} CompletionChoice
 * @property {number} index - The index of the choice.
 * @property {CompletionMessage} message - The completion message.
 * @property {Object} logprobs - The log probabilities.
 * @property {string} finish_reason - The finish reason.
 */

/**
 * @typedef {Object} CompletionMessage
 * @property {string} role - The role of the message.
 * @property {string} content - The content of the message.
 */

/**
 * @typedef {Object} CompletionUsage
 * @property {number} prompt_tokens - The number of prompt tokens.
 * @property {number} completion_tokens - The number of completion tokens.
 * @property {number} total_tokens - The total number of tokens.
 * @property {Object} completion_tokens_details - The completion tokens details.
 */

/**
 * OpenAI class for interacting with the OpenAI API.
 */
class OpenAI {
  constructor(config) {
    if (config.LLM_API_KEY) {
      this.LLM_API_KEY = config.LLM_API_KEY;
    } else {
      throw new Error("LLM_API_KEY is not defined.");
    }
    if (config.COMPLETION_API) {
      this.COMPLETION_API = config.COMPLETION_API;
    } else {
      throw new Error("COMPLETION_API is not defined.");
    }
  }

  /**
    * Builds a POST request with the given body.

    * @param {Object} body - The body of the request.
    * @returns {Object} - The POST request.
  */
  buildPostRequest(body) {
    return {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.LLM_API_KEY}`,
      },
      body: JSON.stringify(body),
    };
  }

  /**
   * Sends a prompt to the completion API and returns the response.
   *
   * @param {string} systemPrompt - The prompt to send to the completion API. Defines the context for the user prompt.
   * @param {string} userPrompt - The prompt to send to the completion API.
   * @param {Object} options - The options for the completion API.
   * @param {string} [options.model="gpt-3.5-turbo"] - The model to use for the completion.
   * @param {number} [options.temperature=1] - The temperature to use for the completion. The higher the temperature, the more creative the completion.
   * @param {number} [options.max_tokens=1024] - The maximum number of tokens to generate.
   * @param {number} [options.top_p=1] - The nucleus sampling probability.
   * @returns {Promise<CompletionResponse>} - The response from the completion API.
   */
  async completion(
    systemPrompt,
    userPrompt,
    {
      model = "gpt-3.5-turbo",
      temperature = 1,
      max_tokens = 512,
      top_p = 1,
    } = {}
  ) {
    const request = fetch(
      this.COMPLETION_API,
      this.buildPostRequest({
        model: model,
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        temperature: temperature,
        max_tokens: max_tokens,
        top_p: top_p,
      })
    ).then((res) => res.json());

    /** @type {CompletionResponse} */
    const response = await request;
    console.log(response);
    return response;
  }
}
