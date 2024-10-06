const MAX_TOKEN = 16385;
/**
 * @typedef {Object} PlaylistItem
 * @property {string} title - The title of the playlist item.
 * @property {string} description - The description of the playlist item.
 * @property {string} publishedAt - The published date of the playlist item.
 */

/**
 * AiSummary class for generating summaries of YouTube Channels.
 */
class AiSummary {
  constructor(config) {
    this.config = config;
    this.cache = new UpStash(config.UPSTASH_API, config.UPSTASH_TOKEN);
    this.llm = new OpenAI(config);
  }

  /**
   * Parse a playlist item into a string.
   * @private
   * @param {PlaylistItem} item - The playlist item to parse.
   * @returns {string} The stringified playlist item.
   */
  parsePlaylistItem(item) {
    const { title, description, publishedAt } = item;

    // Remove new lines and extra spaces from the description.
    const cleanedDescription = description
      .replace(/\n/g, " ")
      .replace(/\s+/g, " ")
      // Remove repeated characters (>3 times) from the description.
      .replace(/(\w)\1{3,}/g, "$1")
      // Remove urls and license codes from the description.
      .replace(/(https?:\/\/[^\s]+)/g, "")
      .replace(/License code: [A-Z0-9]+/g, "");

    return JSON.stringify({
      title,
      description: cleanedDescription,
      publishedAt,
    });
  }

  /**
   * Generate summary of a YouTube Channel based on a list of playlist items.
   * @private
   * @param {string} channelName - The name of the channel.
   * @param {Array.<PlaylistItem>} playlistItems - The list of playlist items.
   * @returns {Promise<string>} The summary of the YouTube Channel.
   */
  async summarizePlaylist(channelName, playlistItems) {
    const stringifiedItems =
      `Channel name: ${channelName} \nPlaylist items: \n` +
      playlistItems.map(this.parsePlaylistItem).join("\n");

    console.log(stringifiedItems);

    const sysPrompt = `
    You are a content analyst with expertise in understanding YouTube Channels 
    and their audiences. I will provide you with a list of video 
    titles, descriptions, and publish dates from a YouTuber's recent uploads. 
    Your job is to write a short, engaging summary of the Channel, 
    highlighting their content focus, video style, personality, target audience, 
    and recent trends. I want someone who has never watched their channel to get 
    a clear, interesting impression of the Channel in 15 words.`;

    const completionResult = await this.llm.completion(
      sysPrompt,
      stringifiedItems.slice(0, MAX_TOKEN)
    );

    return completionResult.choices[0].message.content;
  }

  /**
   * Get the summary of a YouTube Channel.
   * @param {string} channelId - The ID of the YouTube Channel.
   * @param {string} channelName - The name of the YouTube Channel.
   * @param {Array.<PlaylistItem>} playlistItems - The list of playlist items.
   * @returns {Promise<string>} The summary of the YouTube Channel.
   */
  async getChannelSummary(channelId, channelName, playlistItems) {
    // Check cache for existing channelId
    const cacheKey = `channel-summary:${channelId}`;
    const cachedSummary = await this.cache.getCache(cacheKey);

    if (cachedSummary) {
      return cachedSummary;
    } else {
      // Generate summary
      const summary = await this.summarizePlaylist(channelName, playlistItems);

      // Cache the summary
      if (summary) this.cache.setCache(cacheKey, summary);

      return summary;
    }
  }
}
