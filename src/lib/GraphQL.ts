type GQLHeaders = {
  Authorization: string;
};

export interface IGraphQL {
  query<T extends any = any>(
    templateStrings: TemplateStringsArray,
    ...args: Array<any>
  ): Promise<T>;
  query<T extends any = any>(query: string, variables?: object): Promise<T>;

  dispose(): void;
}

class GraphQLContent implements IGraphQL {
  private readonly endpoint: string;

  public constructor(endpoint: string, _headers?: GQLHeaders) {
    console.log("Creating GraphQLContent");
    this.endpoint = endpoint;
  }

  public async query<T extends any = any>(
    a: string | TemplateStringsArray,
    b?: object | Array<any>
  ): Promise<T> {
    const typeA = typeof a;
    const typeB = typeof b;
    if ((typeA === "string" && typeB === "object") || typeB === "undefined") {
      return new Promise((resolve, reject) => {
        try {
          chrome.runtime.sendMessage(
            { query: a, variables: b ?? {}, endpoint: this.endpoint },
            (response) => {
              if ("error" in response) {
                reject(response.error);
              } else {
                resolve(response);
              }
            }
          );
        } catch (e) {
          reject(e);
        }
      });
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

  public dispose() {
    // No-op
  }
}

class GraphQLBackground implements IGraphQL {
  private readonly endpoint: string;
  private readonly headers: GQLHeaders;

  constructor(endpoint: string, headers: GQLHeaders) {
    console.log("Creating GraphQLBackground");

    this.endpoint = endpoint;
    this.headers = headers;

    console.log("Registering GraphQL listener");
    chrome.runtime.onMessage.addListener(this.onMessage);
  }

  protected onMessage(
    request,
    _sender: chrome.runtime.MessageSender,
    sendResponse: (response?: any) => void
  ) {
    console.debug("Received message", request);
    if (
      "query" in request &&
      "variables" in request &&
      "endpoint" in request &&
      request.endpoint === this.endpoint
    ) {
      let answered = false;

      this.query(request.query, request.variables)
        .then((data) => {
          if (!answered) {
            answered = true;
            sendResponse(data);
          }
        })
        .catch((e) => {
          if (!answered) {
            answered = true;
            sendResponse({ error: e });
          }
        });

      setTimeout(() => {
        if (!answered) {
          answered = true;
          sendResponse({ error: "Timeout" });
        }
      }, 2000);
    }

    return true;
  }

  async query<T extends any = any>(
    a: string | TemplateStringsArray,
    b?: object | Array<any>
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

      if (response.ok) {
        const json = await response.json();

        if (json.errors) {
          throw new Error(json.errors[0].message);
        }

        return json.data;
      } else {
        console.error(response);
        throw new Error(await response.text());
      }
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

  public dispose() {
    chrome.runtime.onMessage.removeListener(this.onMessage);
  }
}

export const GraphQL: new (endpoint: string, headers: GQLHeaders) => IGraphQL =
  "window" in globalThis ? GraphQLContent : GraphQLBackground;
