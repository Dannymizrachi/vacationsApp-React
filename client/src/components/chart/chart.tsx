import * as React from "react";
import Paper from "@material-ui/core/Paper";
import {
  ArgumentAxis,
  ValueAxis,
  BarSeries,
  Chart,
} from "@devexpress/dx-react-chart-material-ui";
import axios from "axios";

import "./chart.css";
import { Vacation } from "../../models/Vacation";

//chart interface state
interface chartState {
  followedVacations: Vacation[];
}

export default class ChartPage extends React.Component<any, chartState> {
  constructor(props: any) {
    super(props);
    this.state = {
      followedVacations: [],
    };
  }

  public async componentDidMount() {
    //interceptor
    axios.defaults.baseURL = "http://localhost:3001/";
    let token = sessionStorage.getItem("token");
    axios.defaults.headers.common = { authorization: `Bearer ${token}` };

    // get followed vacations from DB
    try {
      const response = await axios.get<any[]>(
        "http://localhost:3001/vacations/get-followed-vacations"
      );
      for (let index = 0; index < response.data.length; index++) {
        if (response.data[index].isFollowed === null) {
          response.data[index].isFollowed = false;
        } else {
          response.data[index].isFollowed = true;
          response.data[index].vacation_id = String(
            response.data[index].vacation_id
          );
        }
      }
      this.setState({ followedVacations: response.data });
    } catch (error) {
      alert("Failed to get Vacations, " + error.message);
    }
  }

  public render(): React.ReactNode {
    return (
      <div className="mainContainer">
        <h2>Followed Vacations</h2>
        <div className="row">
          <div className="col-lg-3"></div>
          <div className="col-lg-6 chartContainer">
            <Paper>
              <Chart data={this.state.followedVacations}>
                <ArgumentAxis />
                <ValueAxis showGrid={true} showLine={true} showTicks={false} />

                <BarSeries
                  name="Units Sold"
                  valueField="number_of_followers"
                  argumentField="vacation_id"
                />
              </Chart>
            </Paper>
          </div>
          <div className="col-lg-3"></div>
        </div>
      </div>
    );
  }
}
