export interface Option {
  optName: string;
  optValue: string;
}

export interface Payload {
  alg: "HS256" | "HS512";
  secret: string;
  aud: string;
  iss: string;
  sub: string;
  room: string;
  exp: number;
  cntx: {
    user: {
      name: string;
      email: string;
      avatar: string;
      affi: "" | "owner" | "member";
    };
    feat: {
      rec: "" | "0" | "1";
      live: "" | "0" | "1";
      screen: "" | "0" | "1";
    };
  };
}
