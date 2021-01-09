import React, { Component } from "react";
import { store } from "../../redux/store";
import axios from "axios";
import { Vacation } from "../../models/Vacation";
import { ActionType } from "../../redux/action-type";
import { Unsubscribe } from "redux";
import Toggle from "react-toggle";
import "./main.css";
import { ChangeEvent } from "react";
import TextField from "@material-ui/core/TextField";
import  SocketIo  from "socket.io-client";
import { connected } from "process";


//interface for main page state
interface mainpPageState {
  vacations: Vacation[];

  vacationSearch: Vacation;
}

export default class Main extends Component<any, mainpPageState> {
  private unsubscribeStore: Unsubscribe;
  private socket :any;
  constructor(props: any) {
    super(props);

    this.state = {
      vacations: [],

      vacationSearch: new Vacation(),
    };
  }

  public async componentDidMount() {
    //interceptor
    axios.defaults.baseURL = "http://localhost:3001/";
    let token = sessionStorage.getItem("token");
    axios.defaults.headers.common = { authorization: `Bearer ${token}` };

    this.socket = SocketIo("http://localhost:3002", {query: "userId=" + sessionStorage.getItem("token")})


    this.registerAllSocketListeners()

    this.unsubscribeStore = store.subscribe(() =>
      this.setState({
        vacations: store.getState().vacations,
      })
    );

    //check if store has vacation in not request from DB
    if (store.getState().vacations.length === 0) {
      try {
        let response = await axios.get<Vacation[]>(
          "http://localhost:3001/vacations/"
        );
        //change is followed into true or false for checkbox
        for (let index = 0; index < response.data.length; index++) {
          if (response.data[index].isFollowed === null) {
            response.data[index].isFollowed = false;
          } else {
            response.data[index].isFollowed = true;
          }
        }
        //sort the array by true first
        response.data.sort(function (x, y) {
          return x.isFollowed === y.isFollowed ? 0 : x.isFollowed ? -1 : 1;
        });

        store.dispatch({
          type: ActionType.GetAllVacations,
          payload: response.data,
        });
      } catch (error) {
        this.props.history.push("/login");
      }
    } else {
      this.setState({
        vacations: store.getState().vacations,
      });
    }
  }



  private registerAllSocketListeners(){

    this.socket.on("edit-vacation", (editedVacation:Vacation) =>{
      let vacations=this.state.vacations
      vacations.push(editedVacation)
      this.setState({ vacations });
      console.log(editedVacation)
    })

    this.socket.on("delete-vacation", (deletedVacation:Vacation) =>{
      let vacations=this.state.vacations
    for (let index = 0; index < vacations.length; index++) {
        if(vacations[index].vacationId===deletedVacation.vacationId){
          vacations.splice(index,1)
        }
      this.setState({ vacations });
    }
    })
  }



  // on destination search binding to local state
  private onSearchDestination = (args: ChangeEvent<HTMLInputElement>) => {
    const destination = args.target.value;
    const vacationSearch = { ...this.state.vacationSearch };
    vacationSearch.destination = destination;
    this.setState({ vacationSearch });
  };

  // on start date search binding to local state
  private onSearchStartDate = (args: ChangeEvent<HTMLInputElement>) => {
    const start_date = args.target.value;
    const vacationSearch = { ...this.state.vacationSearch };
    vacationSearch.start_date = start_date;
    this.setState({ vacationSearch });
  };

  // on end date search binding to local state
  private onSearchEndDate = (args: ChangeEvent<HTMLInputElement>) => {
    const end_date = args.target.value;
    const vacationSearch = { ...this.state.vacationSearch };
    vacationSearch.end_date = end_date;
    this.setState({ vacationSearch });
  };

  //request filtered vacations by search
  public searchVacation = async () => {
    try {
      const response = await axios.post<Vacation[]>(
        "http://localhost:3001/vacations/search-vacation",
        this.state.vacationSearch
      );
      const filteredVacations = response.data;
      this.setState({ vacations: filteredVacations });
    } catch (error) {
      alert("Failed to search vacation, " + error.message);
    }
  };

  //clear search and get all vacations
  public clearSearch = async () => {
    try {
      let response = await axios.get<Vacation[]>(
        "http://localhost:3001/vacations/"
      );

      for (let index = 0; index < response.data.length; index++) {
        if (response.data[index].isFollowed === null) {
          response.data[index].isFollowed = false;
        } else {
          response.data[index].isFollowed = true;
        }
      }
      //sort the array with followed first
      response.data.sort(function (x, y) {
        return x.isFollowed === y.isFollowed ? 0 : x.isFollowed ? -1 : 1;
      });

      store.dispatch({
        type: ActionType.GetAllVacations,
        payload: response.data,
      });
    } catch (error) {
      this.props.history.push("/login");
    }
  };

  // follow or unfollow request for DB
  private OnfollowVacationClicked = async (
    args: ChangeEvent<HTMLInputElement>
  ) => {
    let currentVacationId = args.target.id.substring(7);
    let vacation = new Vacation();
    vacation.vacationId = +currentVacationId;
    const followChecked = args.target.checked;
    if (followChecked) {
      try {
        await axios.post<void>(
          "http://localhost:3001/vacations/follow-vacation",
          vacation
        );
      } catch (error) {
        console.log(error);
        alert("Failed to get Vacations, " + error.message);
      }
    } else {
      try {
        await axios.post<void>(
          "http://localhost:3001/vacations/unfollow-vacation",
          vacation
        );
      } catch (error) {
        console.log(error);
        alert("Failed to get Vacations, " + error.message);
      }
    }
  };
  componentWillUnmount() {
    this.unsubscribeStore();
  }
  public render() {
    return (
      <div className="container-fluid containerFixes">
        <div className="searchSection">
          <div className="input-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 24 24"
              width="24"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            </svg>
            <input
              className="destinationSearchBar"
              type="text"
              name="destinationSearch"
              placeholder="Where to?"
              onChange={this.onSearchDestination}
            />
          </div>

          <form className="dateContainer" noValidate>
            <TextField
              id="date"
              type="date"
              label="Start Date"
              className="textField"
              onChange={this.onSearchStartDate}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <TextField
              id="date"
              type="date"
              label="End Date"
              className="textField"
              onChange={this.onSearchEndDate}
              InputLabelProps={{
                shrink: true,
              }}
            />
            <div className="searchButtonsSection">
              <input
                className="searchButtons"
                type="button"
                onClick={this.searchVacation}
                value="Search vacation"
              />
              <input
                className="searchButtons"
                type="button"
                onClick={this.clearSearch}
                value="Clear search"
              />
            </div>
          </form>

          <br />
        </div>
        <div className="row">
          {this.state.vacations.map((vacation) => (
            <div className="card col-ms-6" key={vacation.vacationId}>
              <img
                className="card-img-top"
                src={vacation.imgSrcString}
                alt="Card cap"
              />
              <div className="card-body">
                <h5 className="card-title">{vacation.destination}</h5>
                <p className="card-text">{vacation.description}</p>
                <br />
                <p className="card-text vacationDetails">
                  <b>Price: </b> {vacation.price} &#36;
                </p>
                <p className="card-text vacationDetails">
                  <b>Start date: </b>
                  {vacation.start_date}
                </p>
                <p className="card-text vacationDetails">
                  <b>End date: </b>
                  {vacation.end_date}
                </p>
                <br />

                <Toggle
                  id={"toggle-" + vacation.vacationId}
                  defaultChecked={vacation.isFollowed}
                  onChange={this.OnfollowVacationClicked}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
}
