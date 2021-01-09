import React, { ChangeEvent, Component } from "react";
import { Unsubscribe } from "redux";
import { Vacation } from "../../models/Vacation";
import { store } from "../../redux/store";
import axios from "axios";
import { ActionType } from "../../redux/action-type";
import "./admin.css";
import Modal from "react-bootstrap/esm/Modal";
import { Button } from "react-bootstrap";
import  SocketIo  from "socket.io-client";

//state interface
interface AdminState {
  vacations: Vacation[];
  show: boolean;
  currentVacation: Vacation;
}

export default class Admin extends Component<any, AdminState> {
  private unsubscribeStore: Unsubscribe;
  private fileInput: HTMLInputElement;
  public baseURL = "http://localhost:3001/uploads/";
  private socket:any;

  constructor(props: any) {
    super(props);
    this.state = {
      vacations: [],
      show: false,
      currentVacation: new Vacation(),
    };
  }

  public async componentDidMount() {
    //interceptor
    axios.defaults.baseURL = "http://localhost:3001/";
    let token = sessionStorage.getItem("token");
    axios.defaults.headers.common = { authorization: `Bearer ${token}` };

    this.socket = SocketIo("http://localhost:3002", {query: "userId=" + sessionStorage.getItem("token")})


    this.unsubscribeStore = store.subscribe(() =>
      this.setState({
        vacations: store.getState().vacations,
      })
    );

    //check store, if empty get all vacations from DB and place in store
    if (store.getState().vacations.length === 0) {
      try {
        const response = await axios.get<Vacation[]>(
          "http://localhost:3001/vacations/"
        );

        store.dispatch({
          type: ActionType.GetAllVacations,
          payload: response.data,
        });
        this.setState({ vacations: response.data });
      } catch (error) {
        this.props.history.push("/login");
      }
    } else {
      this.setState({
        vacations: store.getState().vacations,
      });
    }
  }

  //modal open and close
  modalHandler = () => {
    this.setState({ show: !this.state.show });
  };

  // set destination for edit vacation in local state
  private setDestination = (args: ChangeEvent<HTMLInputElement>) => {
    const destination = args.target.value;
    const currentVacation = { ...this.state.currentVacation };
    currentVacation.destination = destination;
    this.setState({ currentVacation });
  };

  // set description for edit vacation in local state
  private setDescription = (args: ChangeEvent<HTMLInputElement>) => {
    const description = args.target.value;
    const currentVacation = { ...this.state.currentVacation };
    currentVacation.description = description;
    this.setState({ currentVacation });
  };

  // set price for edit vacation in local state
  private setPrice = (args: ChangeEvent<HTMLInputElement>) => {
    const price = +args.target.value;
    const currentVacation = { ...this.state.currentVacation };
    currentVacation.price = price;
    this.setState({ currentVacation });
  };

  // set startDate for edit vacation in local state

  private setStartDate = (args: ChangeEvent<HTMLInputElement>) => {
    const start_date = args.target.value;
    const currentVacation = { ...this.state.currentVacation };
    currentVacation.start_date = start_date;
    this.setState({ currentVacation });
  };

  // set endDate for edit vacation in local state
  private setEndDate = (args: ChangeEvent<HTMLInputElement>) => {
    const end_date = args.target.value;
    const currentVacation = { ...this.state.currentVacation };
    currentVacation.end_date = end_date;
    this.setState({ currentVacation });
  };

  // set image for edit vacation in local state
  private setImage = (args: ChangeEvent<HTMLInputElement>) => {
    const image = args.target.files[0];
    var reader = new FileReader();
    reader.onload = (event) => {
      // console.log(event.target.result);
      this.setState({
        currentVacation: {
          ...this.state.currentVacation,
          imgSrcString: event.target.result.toString(),
          img_src: image,
        },
      });
    };
    reader.readAsDataURL(image);
  };

  //place current vacation in the state to be sent for the DB
  private editVacation(vacation: Vacation) {
    this.state.currentVacation.vacationId = vacation.vacationId;
    this.state.currentVacation.description = vacation.description;
    this.state.currentVacation.destination = vacation.destination;
    this.state.currentVacation.start_date = vacation.start_date;
    this.state.currentVacation.end_date = vacation.end_date;
    this.state.currentVacation.price = vacation.price;

    this.state.currentVacation.img_src = vacation.img_src;
    console.log(this.state.currentVacation)
  }

  //send edit vacation details and refresh page
  public sendEditVacation = async () => {

    console.log(this.state.currentVacation)

    const myFormData = new FormData();
    myFormData.append(
      "start_date",
      this.state.currentVacation.start_date.toString()
    );
    myFormData.append(
      "end_date",
      this.state.currentVacation.end_date.toString()
    );
    myFormData.append("destination", this.state.currentVacation.destination);
    myFormData.append("description", this.state.currentVacation.description);
    myFormData.append("price", this.state.currentVacation.price.toString());
    myFormData.append(
      "vacationId",
      this.state.currentVacation.vacationId.toString()
    );

    myFormData.append("image", this.state.currentVacation.img_src);
    // console.log(myFormData.get("start_date"));
    try {
      const response = await axios.post<Vacation>(
        "http://localhost:3001/file",
        myFormData
      );

      
      this.setState({ currentVacation: new Vacation() });
    } catch (error) {
      console.log(error);
      alert("Failed to edit Vacation, " + error.message);
    }

    try {
      const response = await axios.get<Vacation[]>(
        "http://localhost:3001/vacations/"
      );

     

      store.dispatch({
        type: ActionType.GetAllVacations,
        payload: response.data,
      });
    } catch (error) {
      console.log(error);
      alert("Failed to get Vacations, " + error.message);
    }
  };

  // delete selected vacation and refresh page
  private async deleteVacation(vacation: Vacation) {
    let vacationId = new Vacation();
    vacationId.vacationId = vacation.vacationId;
    console.log(vacationId);
    try {
      await axios.post<Vacation>(
        "http://localhost:3001/vacations/delete-vacation",
        vacationId
      );

      alert("Product deleted successfuly!");
      this.setState({ currentVacation: new Vacation() });
    } catch (error) {
      console.log(error);
      alert("Failed to delete Vacation, " + error.message);
    }
    try {
      const response = await axios.get<Vacation[]>(
        "http://localhost:3001/vacations/"
      );

      store.dispatch({
        type: ActionType.GetAllVacations,
        payload: response.data,
      });
    } catch (error) {
      console.log(error);
      alert("Failed to get Vacations, " + error.message);
    }
  }

  componentWillUnmount() {
    this.unsubscribeStore();
  }
  public render() {
    return (
      <div className="mainWrapper">
        <div className="container-fluid containerFixes">
          <div className="row">
            {this.state.vacations.map((vacation: any) => (
              <div className="card col-ms-6" key={vacation.vacationId}>
                <img
                  className="card-img-top"
                  src={vacation.imgSrcString}
                  alt="Card cap"
                />
                <div className="card-body">
                  <h5 className="card-title">{vacation.destination}</h5>
                  <p className="card-text">{vacation.description}</p>
                  <p className="card-text">Price: {vacation.price}</p>
                  <p className="card-text">Start date: {vacation.start_date}</p>
                  <p className="card-text">End date: {vacation.end_date}</p>
                  <br />
                  <button
                    className="editButton"
                    onClick={() => {
                      this.editVacation(vacation);
                      this.modalHandler();
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" />
                    </svg>
                  </button>
                  <br />

                  <button
                    className="deleteButton"
                    onClick={() => {
                      this.deleteVacation(vacation);
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      height="24"
                      viewBox="0 0 24 24"
                      width="24"
                    >
                      <path d="M0 0h24v24H0z" fill="none" />
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}

            <Modal show={this.state.show} onHide={this.modalHandler}>
              <Modal.Header closeButton>
                <h2> Edit Vacation</h2>
              </Modal.Header>
              <Modal.Body className="modalBody">
                <input
                  type="text"
                  placeholder="Destination"
                  value={this.state.currentVacation.destination}
                  onChange={this.setDestination}
                />
                <br />
                <br />
                <input
                  type="text"
                  placeholder="Description"
                  value={this.state.currentVacation.description}
                  onChange={this.setDescription}
                />
                <br />
                <br />
                <input
                  type="number"
                  placeholder="price"
                  value={this.state.currentVacation.price}
                  onChange={this.setPrice}
                />
                <br />
                <br />
                <input
                  type="date"
                  placeholder="Start date"
                  value={this.state.currentVacation.start_date}
                  onChange={this.setStartDate}
                />
                <br />
                <br />
                <input
                  type="date"
                  placeholder="End date"
                  value={this.state.currentVacation.end_date}
                  onChange={this.setEndDate}
                />
                <br />
                <br />
                <input
                  type="file"
                  onChange={this.setImage}
                  className="inputHidden"
                  accept="image/*"
                  ref={(fi) => (this.fileInput = fi)}
                />
                <button
                  className="addImage"
                  type="button"
                  onClick={() => this.fileInput.click()}
                >
                  Upload image
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    enable-background="new 0 0 24 24"
                    height="24"
                    viewBox="0 0 24 24"
                    width="24"
                  >
                    <rect fill="none" height="24" width="24" />
                    <path d="M3,4V1h2v3h3v2H5v3H3V6H0V4H3z M6,10V7h3V4h7l1.83,2H21c1.1,0,2,0.9,2,2v12c0,1.1-0.9,2-2,2H5c-1.1,0-2-0.9-2-2V10H6z M13,19c2.76,0,5-2.24,5-5s-2.24-5-5-5s-5,2.24-5,5S10.24,19,13,19z M9.8,14c0,1.77,1.43,3.2,3.2,3.2s3.2-1.43,3.2-3.2 s-1.43-3.2-3.2-3.2S9.8,12.23,9.8,14z" />
                  </svg>
                </button>
                <br />
                <br />
                <img
                  className="imgSize"
                  src={this.state.currentVacation.imgSrcString}
                />

                <br />
                <br />
              </Modal.Body>
              <Modal.Footer>
                <Button
                  className="submitVacation"
                  type="button"
                  onClick={() => {
                    this.sendEditVacation();
                    this.modalHandler();
                  }}
                >
                  Submit
                </Button>
              </Modal.Footer>
            </Modal>
          </div>
        </div>
      </div>
    );
  }
}
