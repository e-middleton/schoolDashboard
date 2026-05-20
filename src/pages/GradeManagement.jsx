import "../styling/GradeManagement.css"

import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';

import * as React from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

import { styled } from '@mui/material/styles';

const GradeManagement = () => {
  
  /*
  todo:
  - params
  - back button (class page), need to know which class came from
  */
  // if time: add search bar for assignments (?)


  return (
    <Grid container spacing={10} columns={12} sx={{"display": "flex", "justifyContent": "center"}}>

      {/* Left side */}
      <Grid container direction="column" spacing={3} size={{ s: 14, md: 7}}>
        {/* Back Button */}
        <Button sx={{"backgroundColor": "#11578A", "color": "white", "width": 1/6}} startIcon={<ArrowBackIosIcon />} variant="contained">Back </Button>
        
        {/* Header */}
        <h2>[Student Name]'s Grades</h2>

        {/* Add Assignments Button */}
        <Button sx={{"backgroundColor": "#11578A", "color": "white", "width": 1/3}} variant="contained" startIcon={<AddIcon />}>Add Assignment</Button>

        {/* List of Accordians */}
        <Grid container spacing={1}>
          {/* Accordian Row */}
          <Accordion disableGutters
            sx={{
              "width": "100%",
              "backgroundColor": "#FFFDEB", 
              "borderRadius": 2
            }}>

            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography component="span">Quizzes</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Grid container spacing={0.5}>
                <Card sx={{"boxShadow": "none", "flexGrow": 1, "bgcolor": "#F5F3E4", padding: "1rem", "width": "auto", "display": "flex", "justifyContent": "space-between", "flexDirection": "row"}}>
                  <p>Quiz 1</p>
                  <p>95/100</p>
                </Card>
                  <Button sx={{"backgroundColor": "#11578A", "color": "white"}} startIcon={<EditIcon />} variant="contained">Edit</Button>
                  <Button sx={{"backgroundColor": "#CE2626", "color": "white"}} variant="contained" startIcon={<DeleteIcon />}>Delete</Button>
                <Grid container space={1}>
                </Grid>
              </Grid>
            </AccordionDetails>

          </Accordion>

          {/* Accordian Row */}
          <Accordion disableGutters
            sx={{
              "width": "100%",
              "backgroundColor": "#FFFDEB", 
              "borderRadius": 2
            }}>

            <AccordionSummary
              expandIcon={<ExpandMoreIcon />}
            >
              <Typography component="span">Quizzes</Typography>
            </AccordionSummary>

            <AccordionDetails>
              <Typography>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse
                malesuada lacus ex, sit amet blandit leo lobortis eget.
              </Typography>
            </AccordionDetails>

          </Accordion>
        </Grid>

      </Grid>

      {/* Right side */}
      <Grid container direction="column" size={3} spacing={2}>
        <h3>Grade: 94.8%</h3>
        <h3>Assignments are weighted by group:</h3>
        <Grid container direction="column" spacing={0.5}>
          <p>Quizzes 20%</p>
          <p>Participation 25%</p>
          <p>Projects 25%</p>
          <p>Tests 25%</p>
        </Grid>
      </Grid>
      
    </Grid>
  )
}

export default GradeManagement;