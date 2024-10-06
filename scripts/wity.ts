const YOUTUBE_URL = "https://www.youtube.com";
const GOOGLE_API = "https://www.googleapis.com";
const API_KEY = "AIzaSyCNxM2TrpT3Usxsm55FxXI2v3SZzElafPw";

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

            getChannelNSubscriberName(channelHandle).then((result) => {
                if (result) {
                    userProfileCard.updateData(result);
                    userProfileCard.show();
                }
            });

            // Call the function to get the channel name and subscriber count
            getAllVideoTitlesByChannelHandle(channelHandle).then(
                ({ videoTitles, videoDescriptions }) => {
                    if (videoTitles.length > 0) {
                        console.log(
                            `Total Videos Found: ${videoTitles.length}`
                        );
                        userProfileCard.showWordCloud(
                            videoTitles,
                            videoDescriptions
                        );

                        new AiSummary(config)
                            .getChannelSummary(
                                userProfileCard.data.channelHandle,
                                userProfileCard.data.channelName,
                                videoTitles.map((title) => ({
                                    title,
                                    description: "",
                                    publishedAt: "",
                                }))
                            )
                            .then((summary) => {
                                console.log("summary", summary);
                                userProfileCard.updateData({
                                    ...userProfileCard.data,
                                    summary,
                                });
                            });
                    } else {
                        console.log("No videos found for this channel.");
                    }
                }
            );

            target.addEventListener("mouseout", () => userProfileCard.remove());
        }
    }, 30);

window.addEventListener("load", () => {
    console.log("WITY onload");
    const userProfileCard = new UserProfileCard();
    document.addEventListener(
        "mouseover",
        showProfileIfAvailable(userProfileCard)
    );
});
