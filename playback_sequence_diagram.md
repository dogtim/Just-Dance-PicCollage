
sequenceDiagram
    actor User
    participant SamplePlaylist as SamplePlaylist Component
    participant Home as Home Page (page.tsx)
    participant API as /api/process-video
    participant DanceCanvas as DanceCanvas Component

    Note over SamplePlaylist: List populated (Firebase/Local)

    User->>SamplePlaylist: Clicks on a video item
    SamplePlaylist->>Home: onSelect(url, title)
    activate Home
    
    Note right of Home: handlePreset() called
    Home->>Home: setUrl(url)
    Home->>Home: setCurrentVideoTitle(title)
    Home->>Home: startProcessing(id, url)
    
    Home->>Home: setProcessingStatus("Starting...")
    Home->>API: POST /api/process-video {videoId, url}
    activate API
    API-->>Home: Response {status, videoUrl?, meshUrl?}
    deactivate API

    alt status == 'completed'
        Home->>Home: setProcessingStatus(null)
        Home->>Home: setYoutubeId(id)
        Home->>Home: setProcessedVideoUrl(videoUrl)
        Home->>Home: setProcessedMeshUrl(meshUrl)
    else status != 'completed'
        Home->>Home: setProcessingStatus("Processing...")
        loop Every 3 seconds
            Home->>API: GET /api/process-video?videoId=id
            activate API
            API-->>Home: Response {status, videoUrl?, meshUrl?}
            deactivate API
            break when status == 'completed'
                Home->>Home: setProcessingStatus(null)
                Home->>Home: setYoutubeId(id)
                Home->>Home: setProcessedVideoUrl(videoUrl)
                Home->>Home: setProcessedMeshUrl(meshUrl)
            end
        end
    end

    Note right of Home: youtubeId set triggers view switch
    Home->>DanceCanvas: Mount & Render
    activate DanceCanvas
    DanceCanvas->>User: Display Dance Interface (Video + Scoring)
    deactivate Home
