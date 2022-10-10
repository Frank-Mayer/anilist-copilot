import { GraphQL } from "./GraphQL";
import type { IGraphQL } from "./GraphQL";
import { TypedStorage } from "./TypedStorage";

const typedStorage = new TypedStorage();

let api: IGraphQL | undefined = undefined;

export const auth = async () => {
  const token = await typedStorage.get("anilistToken");
  if (token) {
    console.debug("Token found in storage", token);
    if (!api) {
      api = new GraphQL("https://graphql.anilist.co", {
        Authorization: `${token.token_type} ${token.access_token}`,
      });
    }
    return api!;
  } else {
    console.log("No token found");
    return undefined;
  }
};
