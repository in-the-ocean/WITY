const CURSOR_PADDING = 10;
const WINDOW_PADDING = 20;

const getUserProfileCardHTML = (data) => {
    return `
        <div id="user-profile-card" style="position:absolute;">
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
        this.data = data;
        this.el.innerHTML = getUserProfileCardHTML(this.data);
    }

    show() {
        this.el.style.display = "flex";
    }

    remove() {
        this.el.style.display = "none";
    }

}