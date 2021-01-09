import React, { Component } from "react";
import { Switch, Route, BrowserRouter, Redirect } from "react-router-dom";
import "./layout.css";
import Header from "../header/header";
import Footer from "../footer/footer";
import Main from "../main/main";
import Login from "../login/login";
import Admin from "../admin/admin";
import Register from "../register/register";
import ChartPage from "../chart/chart";

export default class Layout extends Component {
  public render() {
    return (
      <BrowserRouter>
        <section className="layout">
          <header>
            <Header />
          </header>

          <main>
            <Switch>
              <Route path="/admin" component={Admin} exact />
              <Route path="/login" component={Login} exact />
              <Route path="/mainPage" component={Main} exact />
              <Route path="/register" component={Register} exact />
              <Route path="/chart" component={ChartPage} exact />

              <Redirect from="/" to="/login" exact />
              <Redirect from="**" to="/login" exact />
            </Switch>
          </main>

          <footer>
            <Footer />
          </footer>
        </section>
      </BrowserRouter>
    );
  }
}
