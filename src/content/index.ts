import { auth } from "../lib/auth";

auth()
  .then((x) => {
    console.log("graphQl", x);
    window["graphQl"] = x;
  })
  .catch((err) => {
    console.error("graphQl", err);
  });

(() => {
  const url = new URL(location.href);

  if (url.origin === "https://aniworld.to") {
    console.log("Aniworld detected");
    if (url.pathname.startsWith("/anime/stream/")) {
      const imdbLink = document.querySelector(
        "a.imdb-link"
      ) as HTMLAnchorElement | null;

      if (imdbLink) {
        const imdbId = imdbLink.dataset.imdb || imdbLink.href.split("/").pop();

        return;
      }

      const urlPath = url.pathname.split("/");
      if (urlPath.length === 6) {
        const animeName = urlPath[3].replace(/-+/g, " ");
        const season = urlPath[4].replace("staffel-", "").replace(/-+/g, " ");
        const episode = urlPath[5].replace("episode-", "").replace(/-+/g, " ");

        console.log("Anime", animeName);
        console.log("Season", season);
        console.log("Episode", episode);
      }
    }
  }
})();
