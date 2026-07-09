declare module "pagedjs" {
  export class Previewer {
    constructor(options?: Record<string, unknown>);
    preview(
      content?: string | Node,
      stylesheets?: (string | Record<string, unknown>)[],
      renderTo?: Element | null
    ): Promise<{ total: number }>;
  }

  export class Handler {
    constructor(chunker?: unknown, polisher?: unknown, caller?: unknown);
    afterPageLayout?(
      pageFragment: Element,
      page: unknown,
      breakToken: { node?: Node; offset?: number } | undefined
    ): void;
  }

  export function registerHandlers(...handlers: (typeof Handler)[]): void;
}
