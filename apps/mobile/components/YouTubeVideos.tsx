import { View, Text, TouchableOpacity, Image } from "react-native";
import * as WebBrowser from "expo-web-browser";
import { Ionicons } from "@expo/vector-icons";

interface YouTubeVideo {
  videoId: string;
  title: string;
  channelTitle: string;
  thumbnail: string;
}

interface YouTubeVideosProps {
  videos: YouTubeVideo[];
  recipeName: string;
  ingredients?: string[];
  genre?: string | null;
}

export function YouTubeVideos({ videos, recipeName, ingredients, genre }: YouTubeVideosProps) {
  const openVideo = async (videoId: string) => {
    await WebBrowser.openBrowserAsync(`https://www.youtube.com/watch?v=${videoId}`);
  };

  return (
    <View style={{ gap: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
        <Ionicons name="logo-youtube" size={20} color="#ef4444" />
        <Text style={{ fontSize: 15, fontWeight: "600", color: "#111827" }}>
          関連動画
        </Text>
      </View>

      {videos.length === 0 ? (
        <Text style={{ fontSize: 14, color: "#6b7280" }}>
          関連YouTubeレシピ動画はありません
        </Text>
      ) : videos.map((video) => (
        <TouchableOpacity
          key={video.videoId}
          onPress={() => openVideo(video.videoId)}
          style={{
            flexDirection: "row",
            gap: 12,
            padding: 8,
            borderRadius: 8,
            backgroundColor: "#f9fafb",
          }}
        >
          <Image
            source={{ uri: video.thumbnail }}
            style={{ width: 120, height: 68, borderRadius: 6 }}
            resizeMode="cover"
          />
          <View style={{ flex: 1, justifyContent: "center" }}>
            <Text
              numberOfLines={2}
              style={{ fontSize: 13, fontWeight: "500", color: "#111827" }}
            >
              {video.title}
            </Text>
            <Text
              numberOfLines={1}
              style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}
            >
              {video.channelTitle}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

