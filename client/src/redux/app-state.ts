// import { Vacation } from "../models/Vacation";
import { SuccessfulLoginServerResponse } from "../models/SuccessfulLoginServerResponse";
import { Vacation } from "../models/Vacation";

export class AppState {
  public vacations: Vacation[] = [];
  public loggedInUser: SuccessfulLoginServerResponse = null;
}
