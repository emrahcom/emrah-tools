export interface Payload {
  alg: "HS256" | "HS512";
  secret: string;
  aud: string;
}
