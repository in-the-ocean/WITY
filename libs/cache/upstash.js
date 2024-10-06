/**
 * UpStash Cache Service
 */
class UpStash {
  /**
   * @param {string} api - UpStash API URL
   * @param {string} token - UpStash API token
   */
  constructor(api, token) {
    this.config = {
      UPSTASH_API: api,
      UPSTASH_TOKEN: token,
    };
  }

  /**
   * Set cache value
   * @param {string} key - Cache key
   * @param {string} value - Cache value
   * @param {Object} options - Additional options
   * @param {number} options.expiry - Cache expiry in seconds
   * @returns {Promise<Object>} The response from the Up
   */
  async setCache(key, value, { expiry = 18000 } = {}) {
    const encodedValue = encodeURIComponent(value);

    const response = await fetch(
      `${this.config.UPSTASH_API}/set/${key}/${encodedValue}/ex/${expiry}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${config.UPSTASH_TOKEN}`,
        },
      }
    ).then((response) => response.json());

    console.log(`Cache set for key ${key}`);
    return response;
  }

  /**
   * Get cache value
   * @param {string} key - Cache key
   * @returns {Promise<string | null>} The response from the Up
   */
  async getCache(key) {
    const response = await fetch(`${this.config.UPSTASH_API}/get/${key}`, {
      headers: {
        Authorization: `Bearer ${config.UPSTASH_TOKEN}`,
      },
    }).then((response) => response.json());

    // Decode the value
    const value = decodeURIComponent(response.result);

    if (!value || ["undefined", "null"].includes(value)) {
      console.log(`Cache miss for key ${key}`);
      return null;
    } else {
      console.log(`Cache hit for key ${key} = ${value}`);
      return value;
    }
  }
}
