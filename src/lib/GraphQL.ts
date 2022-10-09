type GQLHeaders = {
  Authorization: string;
};

export class GraphQL {
  private readonly endpoint: string;
  private readonly headers: GQLHeaders;

  constructor(endpoint: string, headers: GQLHeaders) {
    this.endpoint = endpoint;
    this.headers = headers;
  }

  public async query<T extends any = any>(
    templateStrings: TemplateStringsArray,
    ...args: Array<any>
  ): Promise<T>;
  public async query<T extends any = any>(
    query: string,
    variables?: object
  ): Promise<T>;

  async query<T extends any = any>(
    a: string | TemplateStringsArray,
    b: object | Array<any> | undefined
  ): Promise<T> {
    const typeA = typeof a;
    const typeB = typeof b;
    if ((typeA === "string" && typeB === "object") || typeB === "undefined") {
      const response = await fetch(this.endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...this.headers,
        },
        body: JSON.stringify({
          query: a,
          variables: b ?? {},
        }),
      });

      const json = await response.json();

      if (json.errors) {
        throw new Error(json.errors[0].message);
      }

      return json.data;
    } else if (Array.isArray(a) && Array.isArray(b)) {
      const combinedQuery = a.reduce(
        (acc, cur, i) => acc + cur + (b[i] ?? ""),
        ""
      );
      return this.query(combinedQuery);
    } else {
      throw new Error("Invalid arguments for GraphQL.query");
    }
  }
}
