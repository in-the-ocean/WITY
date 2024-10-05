const CURSOR_PADDING = 10;
const WINDOW_PADDING = 20;

const getUserProfileCardHTML = (data) => {
    return `
        <div style="position:absolute;width:100px;height:100px;">
            <h1 style="font-size:300%;color:blue;">This is a heading</h1>
        </div>
    `
}

class UserProfileCard {
    data;
    el;
    cursor;
    constructor() {
        this.data = {
            channelName: "DrDray",
            subscribers: 30000,
            totalUploads: 312,
        };
        this.el = document.createElement("div");
        this.el.style.position = "absolute";
        this.el.style.display = "none";
        this.el.style.width = "300px";
        this.el.style.height = "300px";
        this.el.style.backgroundColor = "red";
        this.el.style.top = "500px";
        this.el.style.left = "500px";
        // this.el.innerHTML = getUserProfileCardHTML(this.data);
        this.el.innerHTML = 
            `<h1 style="font-size:300%;color:blue;">This is a heading</h1>`
        this.el.style.zIndex = 1600;
        this.cursor = {x: 0, y: 0};

        document.body.appendChild(this.el);
    }

    setCursor(x, y) {
        this.cursor = {x: x, y: y};

        if (this.el) {
            this.el.style.top = `${this.cursor.y}px`;
            this.el.style.left = `${this.cursor.x}px`;
            // let width = this.el.scrollWidth;
            // let height = this.el.scrollHeight;
    
            // if (this.cursor.x + width + WINDOW_PADDING > window.scrollX + window.innerWidth) {
            //     // Will overflow to the right, put it on the left
            //     this.el.style.left = `${this.cursor.x - CURSOR_PADDING - width}px`;
            // } else {
            //     this.el.style.left = `${this.cursor.x+ CURSOR_PADDING}px`;
            // }
    
            // if (this.cursor.y+ height + WINDOW_PADDING > window.scrollY + window.innerHeight) {
            //     // Will overflow to the bottom, put it on the top
            //     if (this.cursor.y- WINDOW_PADDING - height < window.scrollY) {
            //         // Can't fit on top either, put it in the middle
            //         this.el.style.top = `${window.scrollY + (window.innerHeight - height) / 2}px`;
            //     } else {
            //         this.el.style.top = `${this.cursor.y - CURSOR_PADDING - height}px`;
            //     }
            // } else {
            //     this.el.style.top = `${this.cursor.y+ CURSOR_PADDING}px`;
            // }
        }
    }

    show() {
        // this.el.innerHTML = getUserProfileCardHTML(this.data)
        this.el.innerHTML = 
            `<h1 style="font-size:300%;color:blue;">This is a heading</h1>`
        this.el.style.display = "flex";
        console.log(this.el.innerHTML)
    }

    remove() {
        // this.el.style.display = "none";
        // this.data = {};
    }

}