import xboxImg from "../images/xboxlogo.png";
import playfabImg from "../images/playfablogo.png";
import swayImg from "../images/sway.png";
import fiservImg from "../images/fiserv.png";
import ninjaKiwiImg from "../images/ninjakiwi.png";
import uoaImg from "../images/UoA.png";

const ProfessionalSection: React.FC = () => {
  return (
    <section className="section" data-section="section2">
      <div className="section-heading">
        <h2>Professional work</h2>
      </div>
      <div className="right-image-post">
        <div className="row">
          <div className="column">
            <div className="left-text">
              <h4>Tech Lead / Senior Software Engineer, Xbox/PlayFab</h4>
              <p>February 2020 – Present</p>
              <p>
                Designing, developing and maintaing gaming cloud services for
                the "Xbox Network" ecosystem and the "PlayFab" offering from
                Microsoft. I am actively involved in the design, development,
                and maintenance of the Achievements, Leaderboards, Stats and
                Minutes Played service/features.
              </p>
              <div className="white-button">
                <a href="https://playfab.com//">Check out playfab</a>
              </div>
            </div>
          </div>
          <div className="column">
            <div className="right-image">
              <img src={xboxImg} alt="Xbox Logo" />
              <img src={playfabImg} alt="Xbox Logo" />
            </div>
          </div>
        </div>
      </div>
      <div className="left-image-post">
        <div className="row">
          <div className="column">
            <div className="left-image">
              <img src={swayImg} alt="Sway Logo" />
            </div>
          </div>
          <div className="column">
            <div className="right-text">
              <h4>Software Engineer II, Microsoft</h4>
              <p>February 2016 – February 2020</p>
              <p>
                "Instrumental in making Sway accessible” - not only from a
                compliance perspective but also ensuring that the experience is
                "delightful" to all users. Assessing new feature work for the
                Sway team as well as triaging and fixed bug bounties reported by
                the public to ensure the Sway service stays safe and secure.
                Designed and implemented the full stack for the Sway Author
                Analytics feature giving authors the ability to see how their
                Sways are consumed. This involved client tracking and data
                display in our website, creating endpoints for the different
                Sway clients to post and fetch data, using the azure stream
                analytics to process data and SQL database for storing data.
              </p>
              <div className="white-button">
                <a href="https://sway.office.com/">Check out Microsoft Sway</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="right-image-post">
        <div className="row">
          <div className="column">
            <div className="left-text">
              <h4>Junior Software Engineer, Fiserv</h4>
              <p>August 2015 – January 2016</p>
              <p>
                I worked heavily in C# and .NET writing backend services for
                mobile banking applications and deployment pipelines for those
                services.
              </p>
            </div>
          </div>
          <div className="column">
            <div className="right-image">
              <img src={fiservImg} alt="Fiserv Logo" />
            </div>
          </div>
        </div>
      </div>
      <div className="left-image-post">
        <div className="row">
          <div className="column">
            <div className="left-image">
              <img src={ninjaKiwiImg} alt="Ninja Kiwi Logo" />
            </div>
          </div>
          <div className="column">
            <div className="right-text">
              <h4>Game Tester, Ninja Kiwi</h4>
              <p>September 2013 – December 2013</p>
              <p>
                I did Beta testing on Bloons Monkey City and SAS Zombie Assault
                4 to help prepare Ninja Kiwi for the Christmas releases of these
                games. I gained experience with Jira and Git. I contributed to
                design and architectural decisions regarding the game’s
                programming with the developers and was responsible for gaining
                data on the balance of gameplay, as well as other gaming related
                data.
              </p>
              <div className="white-button">
                <a href="https://ninjakiwi.com/">Check out Ninja Kiwi</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="right-image-post">
        <div className="row">
          <div className="column">
            <div className="left-text">
              <h4>University of Auckland</h4>
              <p>BSc, specializing in Computer Science</p>
              <p>
                Graduated June 2015. I worked as a Teaching assistant for the
                University of Auckland’s Computer Science department during the
                third year of my undergraduate degree. I assisted and taught
                students that had questions about their course material or work.
                Also, I was awarded the UoA Jubilee Scholarship for hard work
                and determination.
              </p>
            </div>
          </div>
          <div className="column">
            <div className="right-image">
              <img src={uoaImg} alt="University of Auckland Logo" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProfessionalSection;
