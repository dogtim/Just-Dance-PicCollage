
import json
import os
import sys
import shutil

# Ensure we can import process_video from the same directory
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

try:
    import process_video
except ImportError:
    print("Error: Could not import process_video. Make sure process_video.py is in the same directory.")
    sys.exit(1)

def get_video_id(url):
    """Extracts YouTube video ID from URL."""
    if 'v=' in url:
        return url.split('v=')[1].split('&')[0]
    elif 'youtu.be/' in url:
        return url.split('youtu.be/')[1].split('?')[0]
    elif 'shorts/' in url:
        return url.split('shorts/')[1].split('?')[0]
    return None

def main():
    # Path to the playlist JSON file
    # Assuming the script is run from the project root
    playlist_path = 'src/data/sample_playlist.json'
    
    if not os.path.exists(playlist_path):
        print(f"Error: Playlist file not found at {playlist_path}")
        print("Make sure you are running this script from the project root directory context.")
        return

    print(f"Reading playlist from {playlist_path}...")
    
    try:
        with open(playlist_path, 'r') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error parsing JSON: {e}")
        return

    videos = data.get('videos', [])
    print(f"Found {len(videos)} videos in playlist.")

    # Ensure output directories exist
    os.makedirs('temp', exist_ok=True)
    os.makedirs('public/processed', exist_ok=True)

    for i, video in enumerate(videos, 1):
        url = video.get('url')
        title = video.get('title', 'Unknown Title')
        
        if not url:
            print(f"Skipping video {i}: No URL found.")
            continue

        video_id = get_video_id(url)
        if not video_id:
            print(f"Skipping video {i} ({title}): Could not parse Video ID from {url}")
            continue

        print(f"\n[{i}/{len(videos)}] Processing: {title} (ID: {video_id})")

        input_path = f'temp/{video_id}.mp4'
        output_path = f'public/processed/{video_id}.mp4'
        mesh_path = f'public/processed/{video_id}_action_mesh.json'

        # Check if already processed (both video and mesh)
        if os.path.exists(output_path) and os.path.exists(mesh_path):
            print(f"  -> Skipping: Already processed.")
            continue

        try:
            # Download
            print(f"  -> Downloading...")
            process_video.download_video(url, input_path)

            # Process
            print(f"  -> analyzing pose and rendering...")
            process_video.process_video(input_path, output_path, video_id)
            
            print(f"  -> Done.")

        except Exception as e:
            print(f"  -> ERROR: {e}")
        
        finally:
            # Cleanup temp file
            if os.path.exists(input_path):
                os.remove(input_path)

    print("\nBatch processing complete!")

if __name__ == "__main__":
    main()
