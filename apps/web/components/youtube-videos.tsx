"use client";

import { Youtube } from "lucide-react";
import { useState } from "react";

interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

interface YouTubeVideosProps {
  videos: YouTubeVideo[];
  recipeName: string;
}

export function YouTubeVideos({ videos, recipeName }: YouTubeVideosProps) {
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  return (
    <div className="pt-4 border-t space-y-3 mt-4">
      <h4 className="font-medium text-sm flex items-center gap-2 text-red-700">
        <Youtube className="h-4 w-4" />
        関連しそうなYouTubeレシピ動画
      </h4>

      {playingVideoId && (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${playingVideoId}?autoplay=1`}
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="absolute inset-0 w-full h-full"
          />
        </div>
      )}

      {videos.length > 0 && (
        <div className="space-y-2">
          {videos.map((video) => (
            <button
              key={video.videoId}
              type="button"
              onClick={() =>
                setPlayingVideoId(
                  playingVideoId === video.videoId ? null : video.videoId
                )
              }
              className={`flex gap-3 w-full rounded-lg p-2 text-left transition-colors cursor-pointer ${
                playingVideoId === video.videoId
                  ? "bg-red-50 ring-2 ring-red-300"
                  : "hover:bg-gray-50"
              }`}
            >
              <img
                src={video.thumbnail}
                alt={video.title}
                className="w-32 h-20 object-cover rounded flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium line-clamp-2">
                  {video.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {video.channelTitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      <a
        href={`https://www.youtube.com/results?search_query=${encodeURIComponent(recipeName + " 作り方")}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 w-full justify-center rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 transition-colors py-2 px-4 text-xs text-red-700"
      >
        <Youtube className="h-4 w-4" />
        YouTubeでもっと検索する
      </a>
    </div>
  );
}
