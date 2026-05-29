import { HttpRequest } from "@angular/common/http";

export interface TokenResponse {
  token(req: HttpRequest<any>, token: any): import("@angular/common/http").HttpRequest<unknown>;
  access_token: string,
  refresh_token: string
}
