import { GraphQL } from "./GraphQL";
import { TypedStorage } from "./TypedStorage";

const typedStorage = new TypedStorage();

let api: GraphQL | undefined = undefined;

export const auth = async () => {
  const token = await typedStorage.get("anilistToken");
  if (token) {
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
