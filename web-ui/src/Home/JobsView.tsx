import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import xboxImg from "../images/xboxlogo.png";
import swayImg from "../images/sway.png";
import fiservImg from "../images/fiserv.png";
import ninjaKiwiImg from "../images/ninjakiwi.png";
import uoaImg from "../images/UoA.png";
import ExpandableCard from "./ExpandableCard";

export interface JobHistoryItem {
  company: string;
  role: string;
  description: string;
  logo: string;
}

const jobHistory: JobHistoryItem[] = [
  {
    company: "Xbox/PlayFab",
    role: "Tech Lead/Senior Software Engineer",
    description: `Designing, developing and maintaing gaming cloud services for the "Xbox Network" ecosystem and the "PlayFab" offering from Microsoft. I am actively involved in the design, development, and maintenance of the Achievements, Leaderboards, Stats and Minutes Played service/features.`,
    logo: xboxImg,
  },
  {
    company: "Microsoft Sway",
    role: "Software Engineer II",
    description: `"Instrumental in making Sway accessible” - not only from a compliance perspective but also ensuring that the experience is "delightful" to all users.
    Designed and implemented the full stack for the Sway Author Analytics feature giving authors the ability to see how their Sways are consumed. 
    This involved client tracking and data display in our website, creating endpoints for the different Sway clients to post and fetch data, 
    using the azure stream analytics to process data and SQL database for storing data.`,
    logo: swayImg,
  },
  {
    company: "Fiserv",
    role: "Junior Software Engineer",
    description: `I worked heavily in C# and .NET writing backend services for mobile banking applications and deployment pipelines for those services.`,
    logo: fiservImg,
  },
  {
    company: "Ninja Kiwi",
    role: "Game Tester",
    description:
      "I did Beta testing on Bloons Monkey City and SAS Zombie Assault 4 to help prepare Ninja Kiwi for the Christmas releases of these games. I gained experience with Jira and Git. I contributed to design and architectural decisions regarding the game’s programming with the developers and was responsible for gaining data on the balance of gameplay, as well as other gaming related data.",
    logo: ninjaKiwiImg,
  },
  {
    company: "University of Auckland",
    role: "Teaching Assistant",
    description: `Graduated June 2015. I worked as a Teaching assistant for the University of Auckland’s Computer Science department during the third year of my undergraduate degree. I assisted and taught students that had questions about their course material or work. Also, I was awarded the UoA Jubilee Scholarship for hard work and determination.`,
    logo: uoaImg,
  },
];

export default function JobsView() {
  return (
    <Container
      id="testimonials"
      sx={{
        pt: { xs: 4, sm: 12 },
        pb: { xs: 8, sm: 16 },
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: { xs: 3, sm: 6 },
      }}
    >
      <Box
        sx={{
          width: { sm: "100%", md: "60%" },
          textAlign: { sm: "left", md: "center" },
        }}
      >
        <Typography component="h2" variant="h4" color="text.primary">
          Professional Experience
        </Typography>
      </Box>
      <Grid container spacing={2}>
        {jobHistory.map((job, index) => (
          <ExpandableCard job={job} key={index} />
        ))}
      </Grid>
    </Container>
  );
}
