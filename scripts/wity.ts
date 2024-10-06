const YOUTUBE_URL = "https://www.youtube.com";
const GOOGLE_API = "https://www.googleapis.com";
const API_KEY = "AIzaSyDGU2Js5itra5Tcl9JkvhZFmIYSJFVV_fM";

/**
 * @typedef {Object} ChannelData
 * @property {string} channelName
 * @property {number} subscriberCount
 * @property {string} description
 * @property {string} thumbnails
 * @property {string} banner
 * @property {string[]} videoTitles
 * @property {string} summary
 */

const showProfileIfAvailable = (userProfileCard) =>
  debounce((event) => {
    const target = event.target;
    if (
      target &&
      target.tagName == "A" &&
      target.href &&
      target.href.startsWith(YOUTUBE_URL + "/@")
    ) {
      let channelHandle = target.href.slice(target.href.search("@"));
      console.log("usernameis", channelHandle);

      userProfileCard.setCursor(event.pageX, event.pageY);

      /** @type {ChannelData} */
      const channelData = {};
      // Call the function to get the channel name and subscriber count
      getChannelNSubscriberName(channelHandle)
        .then((result) => {
          if (result) {
            console.log("Channel Name:", result.channelName);
            console.log("Subscriber Count:", result.subscriberCount);
            console.log("description:", result.description);
            console.log("thumbnails:", result.thumbnails);
            console.log("banner:", result.banner);
            channelData.channelName = result.channelName;
            channelData.subscriberCount = result.subscriberCount;
            channelData.description = result.description;
            channelData.thumbnails = result.thumbnails;
            channelData.banner = result.banner;
          }
        })
        .then(() => getAllVideoTitlesByChannelHandle(channelHandle))
        .then((videoTitles) => {
          if (videoTitles.length > 0) {
            console.log(`Total Videos Found: ${videoTitles.length}`);
            console.log(videoTitles[0]);
            channelData.videoTitles = videoTitles;
          } else {
            console.log("No videos found for this channel.");
          }
        })
        .then(() =>
          new AiSummary(config).getChannelSummary(
            channelHandle,
            channelData.channelName,
            channelData.videoTitles.map((title) => ({
              title,
              description: "",
              publishedAt: "",
            }))
          )
        )
        .then((summary) => {
          console.log("summary", summary);
          channelData.summary = summary;
        });

      console.log(userProfileCard.cursor);
      userProfileCard.show();

      // var el = document.createElement("div");
      // el.style.position = "absolute";
      // el.style.display = "flex";
      // el.style.width = "300px";
      // el.style.height = "300px";
      // el.style.backgroundColor = "red";
      // document.body.appendChild(el);

      target.addEventListener("mouseout", () => userProfileCard.remove());
    }
  }, 30);

window.addEventListener("load", () => {
  console.log("WITY onload");
  const upc = new UserProfileCard();
  document.addEventListener("mouseover", showProfileIfAvailable(upc));
});
