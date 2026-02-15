import { Injectable } from '@nestjs/common';

interface YouTubeSearchItem {
  id: { videoId: string };
  snippet: {
    title: string;
    channelTitle: string;
    thumbnails: {
      medium: { url: string; width: number; height: number };
    };
  };
}

export interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

@Injectable()
export class YouTubeService {
  async search(query: string): Promise<YouTubeVideo[]> {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      return [];
    }

    const params = new URLSearchParams({
      part: 'snippet',
      q: `${query} 作り方 レシピ`,
      type: 'video',
      maxResults: '3',
      relevanceLanguage: 'ja',
      key: apiKey,
    });

    const res = await fetch(
      `https://www.googleapis.com/youtube/v3/search?${params}`,
    );

    if (!res.ok) {
      console.error('YouTube API error:', await res.text());
      return [];
    }

    const data = await res.json();

    return (data.items || []).map((item: YouTubeSearchItem) => ({
      videoId: item.id.videoId,
      title: item.snippet.title,
      channelTitle: item.snippet.channelTitle,
      thumbnail: item.snippet.thumbnails.medium.url,
    }));
  }
}
