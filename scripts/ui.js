const CURSOR_PADDING = 10;
const WINDOW_PADDING = 20;


const getProfInfoString = (handle, subs, videos) => {
    return `<strong>${handle}</strong>&nbsp• ${niceNum(subs)}&nbspsubscribers&nbsp•&nbsp${videos}&nbspvideos`;
}

const getSignInPageHTML = () => {
    return `
        <div id="wity-sign-in-page">
            <h1 id="wity-sign-in-title">Sign in to YouTube to use WITY</h1>
            <p id="wity-sign-in-description">WITY needs your authorization to access and manage data on your YouTube account.</p>
            <button id="wity-sign-in-button" type="button">Sign in</button>
        </div>
    `;
};

const getSubscribeButtonHTML = (subscribed) => {
    return `
        <button id="wity-subscribe-button" class="wity-subscribe-button-${subscribed ? "subscribed": "unsubscribed"}" type="button">
            ${subscribed ? "Subscribed" : "Subscribe"}
        </button>
    `;
};

const getUserProfileCardDataHTML = (data) => {
    return `
        <div id="wity-banner-div" style="${
            data.banner
                ? `background-image: url(&quot;${data.banner}&quot;)`
                : `background-color: rgb(${Math.random() * 180}, ${
                      Math.random() * 180
                  }, ${Math.random() * 180})`
        };">
        </div>
        <div id="wity-profile-content">
            <div id="wity-profile-title">
                <img id="wity-profile-image" src="${data.thumbnails}" alt="${
                    data.channelName
                }" />
                <div id="wity-channel-meta">
                    <h1 id="wity-channel-name">${data.channelName}</h1>
                    <p class="channel-meta-item">${
                        getProfInfoString(data.channelHandle, data.subscriberCount, data.videoCount).toString() || ""}
                    </p>
                    <p class="channel-description-item">${
                        data.description || ""
                    }</p>
                    <div id="wity-subscribe">
                        ${
                            data.subscribed !== undefined
                                ? getSubscribeButtonHTML(data.subscribed)
                                : ""
                        }
                    </div>
                </div>
            </div>
        </div>
    `;
};

const getUserProfileCardHTML = (data) => {
    return `
        <div id="user-profile-card" style="position:absolute;">
            <div id="wity-profile-card-data">
                ${getUserProfileCardDataHTML(data)}
            </div>
            <div id="wordcloud-wrapper">
                <div id="word-cloud-canvas-wrapper">
                    <canvas id="word-cloud-canvas" style="width: 100%; height: 0px" height=0></canvas>
                </div>
            </div>
        </div>
    `;
};

class UserProfileCard {
    data;
    el;
    cursor;
    constructor() {
        this.data = {};
        this.el = document.createElement("div");
        this.el.style.position = "absolute";
        this.el.style.display = "none";
        this.el.style.backgroundColor = "red";
        this.el.innerHTML = getUserProfileCardHTML(this.data);
        this.el.style.zIndex = 10000;
        this.cursor = { x: 0, y: 0 };

        this.el.addEventListener("mouseenter", () => {
            clearTimeout(this.remove.timer);
        });

        this.el.addEventListener("mouseleave", () => {
            this.remove();
        });

        document.body.appendChild(this.el);
    }

    setCursor(x, y) {
        this.cursor = { x: x, y: y };

        if (this.el) {
            let width = this.el.scrollWidth;
            let height = this.el.scrollHeight;

            if (
                this.cursor.x + width + WINDOW_PADDING >
                window.scrollX + window.innerWidth
            ) {
                // Will overflow to the right, put it on the left
                this.el.style.left = `${
                    this.cursor.x - CURSOR_PADDING - width
                }px`;
            } else {
                this.el.style.left = `${this.cursor.x + CURSOR_PADDING}px`;
            }

            if (
                this.cursor.y + height + WINDOW_PADDING >
                window.scrollY + window.innerHeight
            ) {
                // Will overflow to the bottom, put it on the top
                if (this.cursor.y - WINDOW_PADDING - height < window.scrollY) {
                    // Can't fit on top either, put it in the middle
                    this.el.style.top = `${
                        window.scrollY + (window.innerHeight - height) / 2
                    }px`;
                } else {
                    this.el.style.top = `${
                        this.cursor.y - CURSOR_PADDING - height
                    }px`;
                }
            } else {
                this.el.style.top = `${this.cursor.y + CURSOR_PADDING}px`;
            }
        }
    }

    showSignInPage() {
        console.log("showing sign in page");
        var channel_data = document.getElementById("wity-profile-card-data");
        channel_data.innerHTML = getSignInPageHTML();
        let button = document.getElementById("wity-sign-in-button");
        button.onclick = () => {
            chrome.runtime.sendMessage(
                { type: "GET_ACCESS_TOKEN", interactive: true },
                (response) => {
                    console.log("new token", response);
                }
            );
            this.remove();
        };
        this.setCursor(this.cursor.x, this.cursor.y);
        this.show();
    }

    updateData(data) {
        console.log("updating data", data.summary);
        var channel_data = document.getElementById("wity-profile-card-data");
        this.data = data;
        channel_data.innerHTML = getUserProfileCardDataHTML(this.data);
        this.setCursor(this.cursor.x, this.cursor.y);
    }

    show() {
        this.el.style.display = "flex";
        this.setCursor(this.cursor.x, this.cursor.y);
    }

    showSubscribedButton(subscribed) {
        let subscribeButton = document.getElementById("wity-subscribe");
        subscribeButton.innerHTML = getSubscribeButtonHTML(subscribed);

        let button = document.getElementById("wity-subscribe-button");
        button.onclick = () => {
            button.disabled = true;

            chrome.runtime.sendMessage(
                {
                    type: "GET_ACCESS_TOKEN",
                    interactive: false,
                },
                (response) => {
                    if (response && response.success) {
                        let token = response.token;
                        if (this.data.subscribed) {
                            // unsubscribe
                            unsubscribeFrom(this.data.subscriptionId, token).then(
                                () => {
                                    console.log("unsubscribed");
                                    this.data.subscribed = false;
                                    this.showSubscribedButton(false);
                                }
                            );
                        } else {
                            // subscribe
                            subscribeTo(this.data.channelId, token).then(
                                (result) => {
                                    console.log("subscribed", result);
                                    this.data.subscribed = true;
                                    this.data.subscriptionId = result.id;
                                    this.showSubscribedButton(true);
                                }
                            );
                        }
                    }
                });
        }
    }

    remove() {
        clearTimeout(this.remove.timer);
        this.remove.timer = setTimeout(() => {
            this.data = {};
            this.el.style.display = "none";
            let canvas = document.getElementById("word-cloud-canvas");
            canvas.style.height = "0px";
            canvas.height = 0;
        }, 500);
    }

    countWords(videoTitles, descriptions) {
        let wordCount = {};
        videoTitles.forEach((title) => {
            // title = title.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
            title = title.replace(
                /\d{4}[-./]\d{1,2}([-./]\d{0,2})?(\s\d{2}:\d{2}:\d{2})?/g,
                ""
            );
            title = title.replace(/[aA][vV]\d+/g, "");
            title = title.replace(/[bB][vV]1[1-9a-km-zA-HJ-NP-Z]{9}/g, "");
            let words = title.split(" ");
            words.forEach((word) => {
                if (!STOP_WORDS.has(word.toLowerCase())) {
                    if (wordCount[word]) {
                        wordCount[word]++;
                    } else {
                        wordCount[word] = 1;
                    }
                }
            });
        });
        // descriptions.forEach(description => {
        //     description = description.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
        //     description = description.replace(/\d{4}[-./]\d{1,2}([-./]\d{0,2})?(\s\d{2}:\d{2}:\d{2})?/g, '');
        //     description = description.replace(/[aA][vV]\d+/g, '');
        //     description = description.replace(/[bB][vV]1[1-9a-km-zA-HJ-NP-Z]{9}/g, '');
        //     let words = description.split(" ");
        //     words.forEach(word => {
        //         if (!STOP_WORDS.has(word.toLowerCase())) {
        //             if (wordCount[word]) {
        //                 wordCount[word]++;
        //             } else {
        //                 wordCount[word] = 1;
        //             }
        //         }
        //     });
        // });
        return wordCount;
    }

    showWordCloud(videoTitles, description) {
        let canvas = document.getElementById("word-cloud-canvas");
        canvas.style.height = `${canvas.offsetWidth / 2}px`;
        canvas.style.fontSize = "12px";
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        console.log("Canvas", canvas.width, canvas.height);

        let wordCount = this.countWords(videoTitles, description);
        const entriesArray = Object.entries(wordCount);
        entriesArray.sort((a, b) => b[1] - a[1]);
        const wordCountArray = entriesArray.slice(0, 100);
        WordCloud(canvas, {
            list: wordCountArray,
            weightFactor:
                (100 / wordCountArray[0][1]) * window.devicePixelRatio,
        });
        this.setCursor(this.cursor.x, this.cursor.y);
    }
}

function niceNum(num) {
    if (typeof num !== "number") {
        num = Number(num);
    }
    let formattedNumber;
    let suffix = " ";
    if (num < 1000) {
        formattedNumber = num;
    } else if (num >= 1000 && num < 1000000) {
        formattedNumber = num / 1000;
        suffix = "K";
    } else if (num >= 1000000 && num < 1000000000) {
        formattedNumber = num / 1000000;
        suffix = "M";
    } else if (num >= 1000000000) {
        formattedNumber = num / 1000000000;
        suffix = "B";
    } else {
        formattedNumber = -1 * num;
    }
    return `${formattedNumber}${suffix}`;
}
