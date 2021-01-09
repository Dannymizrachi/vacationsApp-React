import React, { Component, ChangeEvent } from "react";
import "./register.css";
import { UserRegisterDetails } from "../../models/UserRegisterDetails";
import axios from "axios";

interface RegisterState {
  userName: string;
  password: string;
  firstName: string;
  lastName: string;
}
export default class Register extends Component<any, RegisterState> {
  public constructor(props: any) {
    super(props);
    this.state = {
      userName: "",
      password: "",
      firstName: "",
      lastName: "",
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
  private setFirstName = (args: ChangeEvent<HTMLInputElement>) => {
    const firstName = args.target.value;
    this.setState({ firstName });
  };
  private setLastName = (args: ChangeEvent<HTMLInputElement>) => {
    const lastName = args.target.value;
    this.setState({ lastName });
  };

  private signUp = async () => {
    try {
      let userRegisterDetails = new UserRegisterDetails(
        this.state.userName,
        this.state.password,
        this.state.firstName,
        this.state.lastName
      );
      await axios.post(
        "http://localhost:3001/users/register",
        userRegisterDetails
      );
      this.props.history.push("/login");
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
        <input
          type="text"
          placeholder="first name"
          name="first name"
          value={this.state.firstName}
          onChange={this.setFirstName}
        />
        <br />
        <input
          type="text"
          placeholder="last name"
          name="last name"
          value={this.state.lastName}
          onChange={this.setLastName}
        />
        <br />

        <input type="button" value="Sign Up" onClick={this.signUp} />
      </div>
    );
  }
}
