
const CURSOR_PADDING = 10;
const WINDOW_PADDING = 20;

const getUserProfileCardDataHTML = (data) => {
    return `
        <div id="wity-banner-div" style="background-image: url(&quot;${data.banner}&quot;);">
        </div>
        <div id="wity-profile-content">
             <div id="wity-profile-title">
                <img id="wity-profile-image" src="${data.thumbnails}" alt="${data.channelName}" />
                <h1 id="wity-channel-name">${data.channelName}</h1>
                <p class="channel-meta-item">${data.channelHandle} • ${data.subscriberCount|| 0} subscribers • ${data.videoCount|| 0} videos</span>
            </div>

            <div class="wity-channel-description">
                <p class="channel-description-item">${data.description || ""}</span>
            </div>
        </div>
    `;
}

const getUserProfileCardHTML = (data) => {
    return `
        <div id="user-profile-card" style="position:absolute;">
            <div id="wity-profile-card-data">
                ${getUserProfileCardDataHTML(data)}
            </div>
            <div id="wordcloud-wrapper">
                <div id="word-cloud-canvas-wrapper"}>
                    <canvas id="word-cloud-canvas" style="width: 100%; height: 20"></canvas>
                </div>
            </div>
        </div>
    `
}

class UserProfileCard {
    data;
    el;
    cursor;
    constructor() {
        this.data = {
        };
        this.el = document.createElement("div");
        this.el.style.position = "absolute";
        this.el.style.display = "none";
        this.el.style.backgroundColor = "red";
        this.el.innerHTML = getUserProfileCardHTML(this.data);
        this.el.style.zIndex = 1600;
        this.cursor = {x: 0, y: 0};

        document.body.appendChild(this.el);
    }

    setCursor(x, y) {
        this.cursor = {x: x, y: y};

        if (this.el) {
            let width = this.el.scrollWidth;
            let height = this.el.scrollHeight;
    
            if (this.cursor.x + width + WINDOW_PADDING > window.scrollX + window.innerWidth) {
                // Will overflow to the right, put it on the left
                this.el.style.left = `${this.cursor.x - CURSOR_PADDING - width}px`;
            } else {
                this.el.style.left = `${this.cursor.x+ CURSOR_PADDING}px`;
            }
    
            if (this.cursor.y+ height + WINDOW_PADDING > window.scrollY + window.innerHeight) {
                // Will overflow to the bottom, put it on the top
                if (this.cursor.y- WINDOW_PADDING - height < window.scrollY) {
                    // Can't fit on top either, put it in the middle
                    this.el.style.top = `${window.scrollY + (window.innerHeight - height) / 2}px`;
                } else {
                    this.el.style.top = `${this.cursor.y - CURSOR_PADDING - height}px`;
                }
            } else {
                this.el.style.top = `${this.cursor.y+ CURSOR_PADDING}px`;
            }
        }
    }

    updateData(data) {
        var channel_data = document.getElementById("wity-profile-card-data");
        this.data = data;
        channel_data.innerHTML = getUserProfileCardDataHTML(this.data);
    }

    show() {
        this.el.style.display = "flex";
    }

    remove() {
        this.el.style.display = "none";
    }

    countWords(videoTitles, descriptions) {
        let wordCount = {};
        videoTitles.forEach(title => {
            // title = title.replace(/(?:https?|ftp):\/\/[\n\S]+/g, '');
            title = title.replace(/\d{4}[-./]\d{1,2}([-./]\d{0,2})?(\s\d{2}:\d{2}:\d{2})?/g, '');
            title = title.replace(/[aA][vV]\d+/g, '');
            title = title.replace(/[bB][vV]1[1-9a-km-zA-HJ-NP-Z]{9}/g, '');
            let words = title.split(" ");
            console.log(words);
            words.forEach(word => {
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
        canvas.width = canvas.offsetWidth * window.devicePixelRatio;
        canvas.height = canvas.offsetHeight * window.devicePixelRatio;
        console.log("Canvas", canvas.width, canvas.height);

        let wordCount = this.countWords(videoTitles, description);
        WordCloud(canvas, { list: Object.entries(wordCount.slice(0, 100)) });

    }


}

function niceNum(num) {
    if (typeof num !== 'number'){
        num = Number(num);
    }
    let formattedNumber;
    let suffix = ' ';
    if (num < 1000){
        formattedNumber = num;
    }
    else if (num >= 1000 && num < 1000000){
        formattedNumber = num/1000;
        suffix = 'K';
    }
    else if (num >= 1000000 && num < 1000000000){
        formattedNumber = num/1000000;
        suffix = 'M';
    }
    else if (num >= 1000000000){
        formattedNumber = num/1000000000;
        suffix = 'B';
    }
    else{
        formattedNumber = (-1)*num
    }
    return `${formattedNumber}${suffix}`;
}
