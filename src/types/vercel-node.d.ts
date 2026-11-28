declare module 'vercel-node' {
  export interface VercelRequest {
    query: { [key: string]: string | string[] };
    body: any;
    method: string;
  }
  export interface VercelResponse {
    status(code: number): this;
    json(body: any): void;
    setHeader(name: string, value: string): this;
    send(body: any): void;
  }
}