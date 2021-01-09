import React, { ChangeEvent, Component } from "react";
import { store } from "../../redux/store";
import { ActionType } from "../../redux/action-type";
import { SuccessfulLoginServerResponse } from "../../models/SuccessfulLoginServerResponse";
import { Button, Modal, Nav, NavDropdown } from "react-bootstrap";
import { Unsubscribe } from "redux";
import { Vacation } from "../../models/Vacation";
import axios from "axios";
import Navbar from "react-bootstrap/Navbar";
import "./header.css";

//header interface state
interface headerState {
  loggedInUser: SuccessfulLoginServerResponse;
  show: boolean;
  vacation: Vacation;
}

export default class Header extends Component<any, headerState> {
  private unsubscribeStore: Unsubscribe;
  private fileInput: HTMLInputElement;
  public addVacationModel: Vacation;

  constructor(props: any) {
    super(props);
    this.state = {
      loggedInUser: null,
      show: false,
      vacation: new Vacation(),
    };
    this.addVacationModel = new Vacation();
  }

  public async componentDidMount() {
    store.subscribe(() =>
      this.setState({
        loggedInUser: store.getState().loggedInUser,
      })
    );
  }
  componentWillUnmount() {
    this.unsubscribeStore();
  }

  //modal open and close handle
  modalHandler = () => {
    this.setState({ show: !this.state.show });
  };

  //set destination for adding a vacation in local state
  private setDestination = (args: ChangeEvent<HTMLInputElement>) => {
    const destination = args.target.value;
    const vacation = { ...this.state.vacation };
    vacation.destination = destination;
    this.setState({ vacation });
  };
  //set description for adding a vacation in local state
  private setDescription = (args: ChangeEvent<HTMLInputElement>) => {
    const description = args.target.value;
    const vacation = { ...this.state.vacation };
    vacation.description = description;
    this.setState({ vacation });
  };

  //set price for adding a vacation in local state
  private setPrice = (args: ChangeEvent<HTMLInputElement>) => {
    const price = +args.target.value;
    const vacation = { ...this.state.vacation };
    vacation.price = price;
    this.setState({ vacation });
  };

  //set start date for adding a vacation in local state
  private setStartDate = (args: ChangeEvent<HTMLInputElement>) => {
    const start_date = args.target.value;
    const vacation = { ...this.state.vacation };
    vacation.start_date = start_date;
    this.setState({ vacation });
  };

  //set end date for adding a vacation in local state
  private setEndDate = (args: ChangeEvent<HTMLInputElement>) => {
    const end_date = args.target.value;
    const vacation = { ...this.state.vacation };
    vacation.end_date = end_date;
    this.setState({ vacation });
  };

  //set image for adding a vacation in local state
  private setImage = (args: ChangeEvent<HTMLInputElement>) => {
    const image = args.target.files[0];
    var reader = new FileReader();
    reader.onload = (event) => {
      console.log(event.target.result);
      this.setState({
        vacation: {
          ...this.state.vacation,
          imgSrcString: event.target.result.toString(),
          img_src: image,
        },
      });
    };
    reader.readAsDataURL(image);
  };

  //add new vacation to DB and refresh page
  private addVacation = async () => {
    const myFormData = new FormData();
    myFormData.append("startDate", this.state.vacation.start_date.toString());
    myFormData.append("endDate", this.state.vacation.end_date.toString());
    myFormData.append("destination", this.state.vacation.destination);
    myFormData.append("description", this.state.vacation.description);
    myFormData.append("price", this.state.vacation.price.toString()); // Can't send number.
    myFormData.append("image", this.state.vacation.img_src);
    try {
      const response = await axios.post<Vacation>(
        "http://localhost:3001/file",
        myFormData
      );
      const product = response.data;

      this.setState({ vacation: new Vacation() });
    } catch (error) {
      console.log(error);
      alert("Failed to add Vacations, " + error.message);
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

  //logout function
  private logout = () => {
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("userType");

    store.dispatch({
      type: ActionType.Login,
      payload: null,
    });
  };

  //navigate rules for home button navigation
  public navigateRules() {
    let userType = sessionStorage.getItem("userType");
    if (userType === "ADMIN") {
      return "/admin";
    } else {
      return "/mainPage";
    }
  }

  public render() {
    return (
      <div className="header">
        <Navbar bg="light-grey" expand="lg">
          <Navbar.Brand href={this.navigateRules()}>MyVacation</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="mr-auto">
              {sessionStorage.getItem("userType") === "ADMIN" && (
                <Nav.Link onClick={this.modalHandler}>Add Vacation</Nav.Link>
              )}
              {sessionStorage.getItem("userType") === "ADMIN" && (
                <Nav.Link href="/chart">Followed Vacations</Nav.Link>
              )}
            </Nav>
            {sessionStorage.getItem("token") !== null && (
              <Nav.Link
                className="logoutButton"
                onClick={this.logout}
                href="/login"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
                </svg>
              </Nav.Link>
            )}
          </Navbar.Collapse>
        </Navbar>

        <Modal show={this.state.show} onHide={this.modalHandler}>
          <Modal.Header closeButton>
            <h2> Add Vacation</h2>
          </Modal.Header>
          <Modal.Body className="modalBody">
            <div className="add-product">
              <input
                type="text"
                onChange={this.setDestination}
                placeholder="Destination"
              />
              <br />
              <br />
              <input
                type="text"
                onChange={this.setDescription}
                placeholder="Description"
              />
              <br />
              <br />

              <input
                type="number"
                onChange={this.setPrice}
                placeholder="Price"
              />
              <br />
              <br />

              <input
                type="date"
                onChange={this.setStartDate}
                placeholder="Start Date"
              />
              <br />
              <br />
              <input
                type="date"
                onChange={this.setEndDate}
                placeholder="End Date"
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
                  height="24"
                  viewBox="0 0 24 24"
                  width="24"
                >
                  <path d="M0 0h24v24H0z" fill="none" />
                  <path d="M19 12v7H5v-7H3v7c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2v-7h-2zm-6 .67l2.59-2.58L17 11.5l-5 5-5-5 1.41-1.41L11 12.67V3h2z" />
                </svg>
              </button>
              <br />
              <br />

              <img className="imgSize" src={this.state.vacation.imgSrcString} />
              <br />
              <br />
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button
              className="submitVacation"
              type="button"
              onClick={() => {
                this.addVacation();
                this.modalHandler();
              }}
            >
              submit
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}
