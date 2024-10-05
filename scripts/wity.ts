const YOUTUBE_URL = "https://www.youtube.com";
const GOOGLE_API = "https://www.googleapis.com";
const API_KEY = "AIzaSyDGU2Js5itra5Tcl9JkvhZFmIYSJFVV_fM";

const showProfileIfAvailable = (event) => {
    const target = event.target;
    if (target && target.tagName == "A" && target.href && target.href.startsWith(YOUTUBE_URL + "/@")) {
        let channelHandle = target.href.slice(target.href.search("@"));
        console.log("usernameis", channelHandle);

        // Existing fetch call (if needed)
        fetch(GOOGLE_API + `/youtube/v3/channels?part=contentDetails&key=${API_KEY}&forHandle=${channelHandle}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
                console.log(channelHandle);
            });

        // Call the function to get the channel name and subscriber count
        getChannelNSubscriberName(channelHandle).then(result => {
            if (result) {
                console.log("Channel Name:", result.channelName);
                console.log("Subscriber Count:", result.subscriberCount);
                console.log("thumbnails:", result.thumbnails);
                console.log("banner:", result.banner);
            }
        });
        getAllVideoTitlesByChannelHandle(channelHandle).then(videoTitles => {
            if (videoTitles.length > 0) {
                console.log(`Total Videos Found: ${videoTitles.length}`);
                videoTitles.forEach((title, index) => {
                    console.log(`${index + 1}. ${title}`);
                });
            } else {
                console.log("No videos found for this channel.");
            }
        });
        console.log("usernameis", channelHandle)
        // fetch(GOOGLE_API + `/youtube/v3/channels?part=contentDetails&key=${API_KEY}&forHandle=${channelHandle}`)
        //     .then((response) => response.json())
        //     .then((data) => {
        //         console.log(data)
        // //     })
        userProfileCard.setCursor(event.pageX, event.pageY);
        console.log(userProfileCard.cursor)
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
};

        

window.addEventListener("load", () => {
    console.log("WITY onload");
    document.addEventListener("mouseover", showProfileIfAvailable);
    userProfileCard = new UserProfileCard();
})