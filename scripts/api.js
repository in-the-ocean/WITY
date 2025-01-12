const notifyInvaidToken = () => {
    chrome.runtime.sendMessage({ type: "INVALID_TOKEN" });
};

const getChannelNSubscriberName = (channelHandle, token) => {
    return fetch(
        `${GOOGLE_API}/youtube/v3/channels?part=snippet,statistics,brandingSettings&forHandle=${encodeURIComponent(
            channelHandle
        )}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
        .then((response) => {
            if (!response.ok) {
                notifyInvaidToken();
                throw new Error("Invalid token");
            }
            return response.json();
        })
        .then((data) => {
            if (data.items && data.items.length > 0) {
                const channelName = data.items[0].snippet.title;
                const channelId = data.items[0].id;
                const description = data.items[0].snippet?.description;
                const subscriberCount =
                    data.items[0].statistics.subscriberCount;
                const videoCount = data.items[0].statistics.videoCount;
                const thumbnails =
                    data.items[0].snippet?.thumbnails?.default?.url;
                const banner =
                    data.items[0].brandingSettings?.image?.bannerExternalUrl;
                return {
                    channelHandle,
                    channelId,
                    channelName,
                    description,
                    subscriberCount,
                    videoCount,
                    thumbnails,
                    banner,
                };
            } else {
                console.log("Channel not found");
                return null;
            }
        })
        .catch((error) => {
            console.log("Error fetching channel name:", error);
            notifyInvaidToken();
            return null;
        });
};

const subscribeTo = async (channelId, token) => {
    return fetch(`${GOOGLE_API}/youtube/v3/subscriptions?part=snippet`, {
        method: "POST",
        headers: {
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            snippet: {
                resourceId: {
                    kind: "youtube#channel",
                    channelId: channelId,
                },
            },
        }),
    })
        .then((response) => {
            if (!response.ok) {
                notifyInvaidToken();
                throw new Error("Invalid token");
            }
            return response.json();
        })
        .then((data) => {
            console.log("Subscription status:", data);
            return data;
        });
};

const unsubscribeFrom = async (subscriptionId, token) => {
    return fetch(`${GOOGLE_API}/youtube/v3/subscriptions?id=${subscriptionId}`, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json"
        },
    })
        .then((response) => {
            if (!response.ok || response.status !== 204) {
                console.log("Error unsubscribing:");
                notifyInvaidToken();
                throw new Error("Invalid token");
            }
        })
}

const getSubscriptionStatus = async (channelId, token) => {
    return fetch(
        `${GOOGLE_API}/youtube/v3/subscriptions?ipart=snippet%2CcontentDetails&forChannelId=${channelId}&mine=true`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
        .then((response) => {
            if (!response.ok) {
                notifyInvaidToken();
                throw new Error("Invalid token");
            }
            return response.json();
        })
};

const getUploadsPlaylistIdByHandle = (channelHandle, token) => {
    return fetch(
        `${GOOGLE_API}/youtube/v3/channels?part=contentDetails,snippet&forHandle=${encodeURIComponent(
            channelHandle
        )}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    )
        .then((response) => {
            if (!response.ok) {
                notifyInvaidToken();
                throw new Error("Invalid token");
            }
            return response.json();
        })
        .then((data) => {
            if (data.items && data.items.length > 0) {
                const uploadsPlaylistId =
                    data.items[0].contentDetails.relatedPlaylists.uploads;
                return uploadsPlaylistId;
            } else {
                console.log("Channel not found");
                return null;
            }
        })
        .catch((error) => {
            console.log("Error fetching uploads playlist ID:", error);
            notifyInvaidToken();
            return null;
        });
};

const getAllPlaylistItems = async (playlistId, token) => {
    let items = [];
    let nextPageToken = "";
    let fetchedItems = 0;
    try {
        do {
            response = await fetch(
                `${GOOGLE_API}/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(
                    playlistId
                )}&maxResults=50&pageToken=${nextPageToken}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (!response.ok) {
                throw new Error("Invalid token");
            }
            const data = await response.json();
            if (data.items && data.items.length > 0) {
                fetchedItems += data.items.length;
                items = items.concat(data.items);
            }
            nextPageToken = data.nextPageToken || "";
        } while (nextPageToken && fetchedItems < 100);
    } catch (error) {
        console.log("Error fetching playlist items:", error);
        notifyInvaidToken();
    }
    return items;
};

const getVideoTitles = (playlistItems) => {
    return playlistItems.map((item) => item.snippet.title);
};

const getVideoDescription = (playlistItems) => {
    return playlistItems.map((item) => item.snippet.description);
};

// Main function to get all video titles using the channel handle
const getAllVideoTitlesByChannelHandle = async (channelHandle, token) => {
    const uploadsPlaylistId = await getUploadsPlaylistIdByHandle(
        channelHandle,
        token
    );
    if (uploadsPlaylistId) {
        const playlistItems = await getAllPlaylistItems(
            uploadsPlaylistId,
            token
        );
        const videoTitles = getVideoTitles(playlistItems);
        const videoDescriptions = getVideoDescription(playlistItems);
        return { videoTitles, videoDescriptions };
    } else {
        return [];
    }
};
