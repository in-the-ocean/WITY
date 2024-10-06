const getChannelNSubscriberName = (channelHandle) => {
    return fetch(`${GOOGLE_API}/youtube/v3/channels?part=snippet,statistics,brandingSettings&forHandle=${encodeURIComponent(channelHandle)}&key=${API_KEY}`)
        .then(response => response.json())
        .then(data => {
            if (data.items && data.items.length > 0) {
                const channelName = data.items[0].snippet.title;
                const description= data.items[0].snippet?.description;
                const subscriberCount = data.items[0].statistics.subscriberCount;
                const videoCount = data.items[0].statistics.videoCount;
                const thumbnails = data.items[0].snippet?.thumbnails?.default?.url;
                const banner = data.items[0].brandingSettings?.image?.bannerExternalUrl
                return { channelHandle, channelName, description, subscriberCount, videoCount, thumbnails, banner};
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
    return fetch(`${GOOGLE_API}/youtube/v3/channels?part=contentDetails,snippet&forHandle=${encodeURIComponent(channelHandle)}&key=${API_KEY}`)
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

const getVideoDescription = (playlistItems) => {
    return playlistItems.map(item => item.snippet.description);
};

// Main function to get all video titles using the channel handle
const getAllVideoTitlesByChannelHandle = async (channelHandle) => {
    const uploadsPlaylistId = await getUploadsPlaylistIdByHandle(channelHandle);
    if (uploadsPlaylistId) {
        const playlistItems = await getAllPlaylistItems(uploadsPlaylistId);
        const videoTitles = getVideoTitles(playlistItems);
        const videoDescriptions = getVideoDescription(playlistItems);
        return {videoTitles, videoDescriptions};
    } else {
        return [];
    }
};



