import * as React from "react";
import "./profile.css";
import { ProfessionalConstants } from "./ProfessionalConstants";
import { ProfessionalComponent } from "./ProfessionalComponent";
import * as reactRouterDom from "react-router-dom";
import harleyImg from "../images/harley.jpg";
import runBoxRunImg from "../images/runboxrun.png";

class Profile extends React.Component<{}, {}> {
  render() {
    const professionalDataPoints = ProfessionalConstants.map((dataPoint) => (
      <ProfessionalComponent {...dataPoint} key={dataPoint.Header} />
    ));

    return (
      <div className="profile">
        <section className="section" data-section="section1">
          <div className="row">
            <div className="column">
              <div className="section-heading">
                <h2>Hi! I'm Harley</h2>
                <h3>International Software Engineer</h3>
              </div>
            </div>
            <div className="column">
              <div className="profileImage">
                <img src={harleyImg} id="profileimage" />
              </div>
            </div>
          </div>
        </section>
        <section className="section" data-section="section2">
          <div className="section-heading">
            <h2>Professional work</h2>
          </div>
          {professionalDataPoints}
        </section>
        <section className="section" data-section="section3">
          <div className="section-heading">
            <h2>For fun Side Projects</h2>
          </div>
          {/* <div className="left-image-post">
            <div className="row">
              <div className="column">
                <div className="left-image">
                  <img src="league.png" alt="" />
                  <p>(Screen shot coming soon)</p>
                </div>
              </div>
              <div className="column">
                <div className="right-text">
                  <h4>League of Legends matchup analysis tool</h4>
                  <p>
                    Utilizing the League of Legends API provided by Riot Games,
                    I made a to see a player's champion (in-game character)
                    win-rate verse other champions. Azure functions fetch the
                    data from Riot's API, calculate win rates and serve expose
                    the data via a REST endpoint. The client is written in react
                    and hosted on this very site!
                  </p>
                  <div className="google-play-wrapper">
                    <form action="lolmatchup">
                      <label>
                        Summoner Name:
                        <input type="text" name="summonerName" />
                      </label>
                      <input type="submit" value="See matchups" />
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div> */}
          {/* <div className="right-image-post">
            <div className="row">
              <div className="column">
                <div className="left-text">
                  <h4>Paper Scissors Rock Multiplayer Game </h4>
                  <p>
                    To learn more about SignalR, websockets and react I created
                    a paper scissors rock game. The front end is written in
                    react, the game is also supported by an authoritive .net
                    core service which utilizes SignalR for client ={">"} server
                    ={">"} client communication.
                  </p>
                </div>
                <div className="white-button">
                  <reactRouterDom.Link to="/game">
                    Play Paper Scissors Rock
                  </reactRouterDom.Link>
                </div>
              </div>
              <div className="column">
                <div className="right-image">
                  <img src="paperscissorsrock.png" alt="" />
                </div>
              </div>
            </div>
          </div> */}
          <div className="right-image-post">
            <div className="row">
              <div className="column">
                <div className="left-text">
                  <h4>Word guess game</h4>
                  <p>
                    For fun clone of the viral "Wordle" puzzle game from 2021.
                    Includes "live service" features such as stat tracking and
                    leaderboards via PlayFab.
                  </p>
                </div>
                <div className="white-button">
                  <reactRouterDom.Link to="/WordGuessGame">
                    Play crosswords
                  </reactRouterDom.Link>
                </div>
              </div>
              <div className="column">
                <div className="right-image">
                  <img src="paperscissorsrock.png" alt="" />
                </div>
              </div>
            </div>
          </div>
          <div className="left-image-post">
            <div className="row">
              <div className="column">
                <div className="left-image">
                  <img src={runBoxRunImg} alt="" />
                </div>
              </div>
              <div className="column">
                <div className="right-text">
                  <h4>Run Box Run</h4>
                  <p>Android game published on the Google Play store</p>
                  <p>
                    During my time at University, I created an android game
                    called Run Box Run. I made it without using any frameworks
                    or libraries besides from built in Java and Android
                    functionality. Unfortunately I didn't maintain my google
                    play account, so RunBoxRun is no longer available on the app
                    store :(.
                  </p>
                  <div className="google-play-wrapper">
                    {/* <a href="https://play.google.com/store/apps/details?id=net.harleyadams.runboxrun">
                      <img
                        alt="Get it on Google Play"
                        src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png"
                        className="google-play-icon"
                      />
                    </a> */}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="right-image-post">
            <div className="row">
              <div className="column">
                <div className="left-text">
                  <h4>Personal Website - harleyadams.dev</h4>
                  <p>
                    This site! Written from scratch in react,
                    Typescript/HTML/CSS. I also use this site (and azure app
                    service plan) to host my web based projects.
                  </p>
                </div>
              </div>
              <div className="column">
                <div className="right-image">
                  <img src="harley.jpg" alt="" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}

export default Profile;
