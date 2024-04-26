import runBoxRunImg from "../images/runboxrun.png";
import wordleRoyaleImg from "../images/wordleroyale.png";
import wordleImg from "../images/wordle.png";
import { Link } from "react-router-dom";

const ProfessionalComponent: React.FC = () => {
  return (
    <section className="section" data-section="section3">
      <div className="section-heading">
        <h2>Projects</h2>
      </div>
      <div className="left-image-post">
        <div className="row">
          <div className="column">
            <div className="left-image">
              <img src={wordleImg} alt="" />
            </div>
          </div>
          <div className="column">
            <div className="right-text">
              <h4>TotallyNotWordle</h4>
              <p>
                Inspired by Josh Wardle's viral "Wordle" puzzle game from 2021.
                Includes "live service" features such as stat tracking and
                leaderboards via PlayFab.
              </p>
            </div>
            <div className="white-button">
              <Link to="/WordGuessGame">Play TotallyNotWordle</Link>
            </div>
          </div>
        </div>
      </div>
      <div className="right-image-post">
        <div className="row">
          <div className="column">
            <div className="left-text">
              <h4>TotallyNotWordle, Battle Royale Edition</h4>
              <p>
                Taking my wordle clone one step further, I updated the game to
                be multiplayer! Players can join a lobby and compete against
                each other to see who can guess the word first. Multiplayer
                functionality is powered by PlayFab.
              </p>
            </div>
            <div className="white-button">
              <Link to="/MultiplayerGames">
                Play TotallyNotWordle Battle Royale
              </Link>
            </div>
          </div>
          <div className="column">
            <div className="right-image">
              <img src={wordleRoyaleImg} alt="" />
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
                During my time at University, I created an android game called
                Run Box Run. I made it without using any frameworks or libraries
                besides from built in Java and Android functionality.
                Unfortunately I didn't maintain my google play account, so
                RunBoxRun is no longer available on the app store :(.
              </p>
              <div className="google-play-wrapper"></div>
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
                This site! Written from scratch in react, Typescript/HTML/CSS. I
                also use this site (and azure app service plan) to host my web
                based projects.
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
  );
};

export default ProfessionalComponent;
