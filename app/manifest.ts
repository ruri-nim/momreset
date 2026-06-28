import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Daily OK",
    short_name: "Daily OK",
    description: "칼로리, 운동, 해야 할 일과 피해야 할 일을 가볍게 기록하는 다이어트 코치 앱",
    start_url: "/",
    display: "standalone",
    background_color: "#fff6aa",
    theme_color: "#fff6aa",
    orientation: "portrait",
    lang: "ko",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
