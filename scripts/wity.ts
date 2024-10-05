const YOUTUBE_URL = "https://www.youtube.com";
const GOOGLE_API = "https://www.googleapis.com";
const API_KEY = "AIzaSyDGU2Js5itra5Tcl9JkvhZFmIYSJFVV_fM";

const showProfileIfAvailable = (event) => {
    const target = event.target;
    if (target && target.tagName == "A" && target.href && target.href.startsWith(YOUTUBE_URL + "/@")) {
        let channelHandle = target.href.slice(target.href.search("@"));
        console.log("usernameis", channelHandle)
        fetch(GOOGLE_API + `/youtube/v3/channels?part=contentDetails&key=${API_KEY}&forHandle=${channelHandle}`)
            .then((response) => response.json())
            .then((data) => {
                console.log(data)
            })
    }
}

window.addEventListener("load", () => {
    console.log("WITY onload");
    document.addEventListener("mouseover", showProfileIfAvailable);
})