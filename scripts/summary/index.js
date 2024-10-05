/**
 * @typedef {Object} PlaylistItem
 * @property {string} title - The title of the playlist item.
 * @property {string} description - The description of the playlist item.
 */

/**
 *
 * @param {Array.<PlaylistItem>} playlistItems
 * @param
 */
async function summarizePlaylist(playlistItems) {
  const stringifiedItems = playlistItems
    .map((item) => {
      return `# ${item.title} \\n ${item.description}`;
    })
    .join("\n");

  console.log(stringifiedItems);

  const sysPrompt =
    "Given the following playlist items, summarize the youtuber's content.";

  const openai = new OpenAI();
  const completionResult = await openai.completion(sysPrompt, stringifiedItems);

  return completionResult.choices[0].message.content;
}
