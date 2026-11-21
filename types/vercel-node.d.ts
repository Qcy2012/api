// Minimal type declarations for @vercel/node request/response handlers.
// This avoids adding @vercel/node as a runtime dependency; Vercel provides it at deploy time.

declare module '@vercel/node' {
  import { IncomingMessage, ServerResponse } from 'http';

  export interface VercelRequest extends IncomingMessage {
    query: { [key: string]: string | string[] | undefined };
    body: any;
    method?: string;
    url?: string;
  }

  export interface VercelResponse extends ServerResponse {
    status(code: number): VercelResponse;
    json(body: any): VercelResponse;
    send(body: any): VercelResponse;
    end(cb?: () => void): this;
    end(chunk: any, cb?: () => void): this;
    end(chunk: any, encoding?: string, cb?: () => void): this;
    setHeader(name: string, value: string | string[]): this;
  }
}
