import { auth } from "../lib/auth";
import type { IGraphQL } from "../lib/GraphQL";
import { TypedStorage } from "../lib/TypedStorage";

const typedStorage = new TypedStorage();

let grqphQl: IGraphQL | undefined = undefined;

auth().then((client) => {
  if (client) {
    grqphQl?.dispose();
    grqphQl = client;
  }
});

typedStorage.onChanged("anilistToken", async () => {
  grqphQl?.dispose();
  grqphQl = await auth();
});

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const url = new URL(tab.url);
    if (
      url.origin === "https://anilist.co" &&
      url.pathname === "/api/v2/oauth/pin" &&
      url.hash.length > 1
    ) {
      const urlParams = new URLSearchParams(url.hash.replace(/^#/, "?"));

      const access_token = urlParams.get("access_token");
      const token_type = urlParams.get("token_type");
      const expires_in = urlParams.get("expires_in");

      if (access_token && token_type && expires_in) {
        typedStorage.set("anilistToken", {
          access_token,
          token_type,
          expires_in: Number(expires_in),
        });
        chrome.tabs.remove(tabId);
      }
    }
  }
});
