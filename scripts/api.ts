const getChannelNSubscriberName = (channelHandle) => {
    return fetch(`${GOOGLE_API}/youtube/v3/channels?part=snippet,statistics&forHandle=${encodeURIComponent(channelHandle)}&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const channelName = data.items[0].snippet.title;
                const subscriberCount = data.items[0].statistics.subscriberCount;
                return { channelName, subscriberCount };
            } else {
                console.log("Channel not found");
                return null;
            }
        })
        .catch(error => {
            console.error("Error fetching channel name:", error);
            return null;
        });
};

const getUploadsPlaylistIdByHandle = (channelHandle) => {
    return fetch(`${GOOGLE_API}/youtube/v3/channels?part=contentDetails&forHandle=${encodeURIComponent(channelHandle)}&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const uploadsPlaylistId = data.items[0].contentDetails.relatedPlaylists.uploads;
                return uploadsPlaylistId;
            } else {
                console.log("Channel not found");
                return null;
            }
        })
        .catch(error => {
            console.error("Error fetching uploads playlist ID:", error);
            return null;
        });
};

const getAllPlaylistItems = async (playlistId) => {
    let items = [];
    let nextPageToken = '';
    do {
        const response = await fetch(`${GOOGLE_API}/youtube/v3/playlistItems?part=snippet&playlistId=${encodeURIComponent(playlistId)}&key=${API_KEY}&maxResults=50&pageToken=${nextPageToken}`);
        const data = await response.json();
        if (data.items && data.items.length > 0) {
            items = items.concat(data.items);
        }
        nextPageToken = data.nextPageToken || '';
    } while (nextPageToken);
    return items;
};

const getVideoTitles = (playlistItems) => {
    return playlistItems.map(item => item.snippet.title);
};

// Main function to get all video titles using the channel handle
const getAllVideoTitlesByChannelHandle = async (channelHandle) => {
    const uploadsPlaylistId = await getUploadsPlaylistIdByHandle(channelHandle);
    if (uploadsPlaylistId) {
        const playlistItems = await getAllPlaylistItems(uploadsPlaylistId);
        const videoTitles = getVideoTitles(playlistItems);
        return videoTitles;
    } else {
        return [];
    }
};



