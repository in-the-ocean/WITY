// Function to authenticate and get an access token
function authenticate(interactive = false) {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive }, (token) => {
            if (chrome.runtime.lastError || !token) {
                console.log(chrome.runtime.lastError);
                reject(chrome.runtime.lastError || "Authentication failed");
                return;
            }
            resolve(token);
        });
    });
}

// Example function to call YouTube API
async function getYouTubeData() {
    try {
        const token = await authenticate();
        const response = await fetch(
            "https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true",
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        );
        const data = await response.json();
        console.log("YouTube Data:", data);
        return token;
    } catch (error) {
        console.error("Error fetching YouTube data:", error);
        throw error;
    }
}

// Listen for a message to trigger the YouTube API request
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "GET_ACCESS_TOKEN") {
        authenticate(message.interactive)
            .then((token) => {
                console.log("authentication success", token);
                sendResponse({ success: true, token: token });
            })
            .catch((error) => {
                console.log("Authentication failed:", error);
                sendResponse({ success: false });
            });
    } else if (message.type === "INVALID_TOKEN") {
        console.log("Invalid token received");
        authenticate(false)
            .then((token) => {
                chrome.identity.removeCachedAuthToken({ token });
            })
            .catch((error) => {
                console.error("Authentication failed:", error);
            });
    }
    return true;
});
