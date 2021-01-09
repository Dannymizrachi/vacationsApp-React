import React, { ChangeEvent, Component } from "react";
import { SuccessfulLoginServerResponse } from "../../models/SuccessfulLoginServerResponse";
import { UserLoginDetails } from "../../models/UserLoginDetails";
import { ActionType } from "../../redux/action-type";
import { store } from "../../redux/store";
import axios from "axios";
import "./login.css";

interface LoginState {
  userName: string;
  password: string;
}

export default class Login extends Component<any, LoginState> {
  public constructor(props: any) {
    super(props);
    this.state = {
      userName: "",
      password: "",
    };
  }
  private setUserName = (args: ChangeEvent<HTMLInputElement>) => {
    const userName = args.target.value;
    this.setState({ userName });
  };

  private setPassword = (args: ChangeEvent<HTMLInputElement>) => {
    const password = args.target.value;
    this.setState({ password });
  };

  private signUp = () => {
    this.props.history.push("/register");
  };

  private login = async () => {
    try {
      let userLoginDetails = new UserLoginDetails(
        this.state.userName,
        this.state.password
      );
      const response = await axios.post<SuccessfulLoginServerResponse>(
        "http://localhost:3001/users/login",
        userLoginDetails
      );
      const serverResponse = response.data;
      sessionStorage.setItem("token", serverResponse.token);

      store.dispatch({
        type: ActionType.Login,
        payload: serverResponse.userType,
      });

      if (serverResponse.userType === "ADMIN") {
        sessionStorage.setItem("userType", "ADMIN");

        this.props.history.push("/admin");
      } else if (serverResponse.userType === "CUSTOMER") {
        sessionStorage.setItem("userType", "CUSTOMER");

        this.props.history.push("/mainPage");
      }
    } catch (error) {
      console.log(error);
      alert("Failed to log-in, " + error.message);
    }
  };

  public render() {
    return (
      <div className="login">
        <input
          type="text"
          placeholder="User name"
          name="userName"
          value={this.state.userName}
          onChange={this.setUserName}
        />
        <br />
        <input
          type="password"
          placeholder="Password"
          name="password"
          value={this.state.password}
          onChange={this.setPassword}
        />
        <br />
        <input type="button" value="login" onClick={this.login} />
        <br />
        <br />
        <input type="button" value="Sign Up" onClick={this.signUp} />
      </div>
    );
  }
}
