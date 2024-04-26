import * as React from "react";
import "./profile.css";
import harleyImg from "../images/harley.jpg";
import ProjectSection from "./ProjectSection";
import ProfessionalSection from "./ProfessionalSection";

class Profile extends React.Component<{}, {}> {
  render() {
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
        <ProfessionalSection />
        <ProjectSection />
      </div>
    );
  }
}

export default Profile;
