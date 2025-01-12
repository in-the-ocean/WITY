const YOUTUBE_URL = "https://www.youtube.com";
const GOOGLE_API = "https://www.googleapis.com";

const getTargetData = (event) => {
    const target = event.target;
    if (
        target &&
        target.tagName == "A" &&
        target.href &&
        target.href.startsWith(YOUTUBE_URL + "/@")
    ) {
        return target.href.slice(target.href.search("@"));
    }
    return null;
};

const showProfileIfAvailable = (channelHandle, event) => {
    clearTimeout(userProfileCard.remove.timer);
    if (channelHandle === userProfileCard?.data?.channelHandle) {
        return;
    }
    console.log("usernameis", channelHandle);
    let token = null;
    chrome.runtime.sendMessage(
        {
            type: "GET_ACCESS_TOKEN",
            interactive: false,
        },
        (response) => {
            if (response && response.success) {
                token = response.token;

                getChannelNSubscriberName(channelHandle, token)
                    .then((result) => {
                        if (result) {
                            userProfileCard.updateData(result);
                            userProfileCard.show();
                        }
                        return result;
                    })
                    .then((result) => {
                        if (result?.channelId) {
                            getSubscriptionStatus(result.channelId, token).then(
                                (subscription) => {
                                    console.log("subscription", subscription)
                                    if (subscription.items.length > 0) {
                                        console.log("subscribed");
                                        userProfileCard.data.subscribed = true;
                                        userProfileCard.data.subscriptionId = subscription.items[0].id;
                                    } else {
                                        console.log("not subscribed");
                                        userProfileCard.data.subscribed = false;
                                    }
                                    userProfileCard.showSubscribedButton(
                                        userProfileCard.data.subscribed
                                    );
                                }
                            );
                        }
                    });

                getAllVideoTitlesByChannelHandle(channelHandle, token).then(
                    ({ videoTitles, videoDescriptions }) => {
                        if (videoTitles.length > 0) {
                            console.log(
                                `Total Videos Found: ${videoTitles.length}`
                            );
                            userProfileCard.showWordCloud(
                                videoTitles,
                                videoDescriptions
                            );
                        } else {
                            console.log("No videos found for this channel.");
                        }
                    }
                );
            } else {
                console.log("no token, ask for login");
                userProfileCard.showSignInPage();
            }
        }
    );

    userProfileCard.setCursor(event.pageX, event.pageY);
    event.target.addEventListener("mouseout", () => userProfileCard.remove());
};

const showProfileDebounced = (event) => {
    clearTimeout(showProfileDebounced.timer);
    let channelHandle = getTargetData(event);
    if (channelHandle === null) {
        return;
    }

    showProfileDebounced.timer = setTimeout(() => {
        showProfileIfAvailable(channelHandle, event);
    }, 150);
};

window.addEventListener("load", () => {
    console.log("WITY onload");
    userProfileCard = new UserProfileCard();
    document.addEventListener("mouseover", showProfileDebounced);
});
