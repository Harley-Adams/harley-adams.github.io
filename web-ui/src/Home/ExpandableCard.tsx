import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Collapse,
  IconButton,
  CardProps,
  SxProps,
  Theme,
  Grid,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { JobHistoryItem } from "./JobsView";

interface ExpandableCardProps {
  job: JobHistoryItem;
}

const logoStyle = {
  maxHeight: "100px",
  alignItems: "center",
  // maxHeight: "50%",
  // width: "64px",
  // opacity: 0.3,
};

const ExpandableCard: React.FC<ExpandableCardProps> = ({ job }) => {
  const [expanded, setExpanded] = useState<boolean>(false);

  const handleExpandClick = (): void => {
    setExpanded(!expanded);
  };

  return (
    <Grid item xs={12} sm={6} md={4} key={job.company} sx={{ display: "flex" }}>
      <Card
        sx={{
          display: "flex",
          flexDirection: "column",
          // justifyContent: "space-between",
          flexGrow: 1,
          p: 1,
          alignItems: "center",
        }}
      >
        <img src={job.logo} style={logoStyle} />
        <CardHeader
          action={
            <IconButton
              onClick={handleExpandClick}
              aria-expanded={expanded}
              aria-label="show more"
              sx={{
                transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                transition: (theme: Theme) =>
                  theme.transitions.create("transform", {
                    duration: theme.transitions.duration.short,
                  }),
              }}
            >
              <ExpandMoreIcon />
            </IconButton>
          }
          title={job.company}
          subheader={job.role}
        />
        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <CardContent>
            <Typography variant="body2" color="text.primary">
              {job.description}
            </Typography>
          </CardContent>
        </Collapse>
      </Card>
    </Grid>
  );
};

export default ExpandableCard;

{
  /* <Grid item xs={12} sm={6} md={4} key={index} sx={{ display: "flex" }}>
  <Card
    sx={{
      display: "flex",
      flexDirection: "column",
      // justifyContent: "space-between",
      flexGrow: 1,
      p: 1,
      alignItems: "center",
    }}
  >
    <img src={logos[index]} alt={`Logo ${index + 1}`} style={logoStyle} />
    <Box
      sx={{
        display: "flex",
        flexDirection: "row",
        // justifyContent: "space-between",
        pr: 2,
      }}
    >
      <CardHeader title={job.company} subheader={job.role} />
    </Box>
    <CardContent>
      <Typography variant="body2" color="text.secondary">
        {job.description}
      </Typography>
    </CardContent>
  </Card>
</Grid>; */
}
