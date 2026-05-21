import "../styling/GradeManagement.css"
import { fetchGrades, addGrade, updateGrade, deleteGrade } from "../utils/grades.js"

import { useState, useEffect } from 'react'
import { useParams } from 'react-router'

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// Icons
// import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import SendIcon from '@mui/icons-material/Send';

// Accordian
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

// Form inputs
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { styled } from '@mui/material/styles';

const GradeManagement = () => {
  
  /*
  todo:
  - refactor components
      - removed unused mui imports
  - add comments

  - interactive
    - dynamically show category and grades
    - dynamically show category in options for new assignment]
    - show and hide new assignment
  - validate grade input; error message
    - prevent typing non-numbers

  - navigation: params, back button (class page), need to know which class came from
  -----------
  - ignore: grade calculation algorithm
  if time: add search bar for assignments (?)
  */

  // Grades for the student and class being viewed
  const [gradeData, setGradeData] = useState({});

  // New Assignment Form Input Values
  const [assignmentFormInput, setAssignmentFormInput] = useState({
    assignmentName: "",
    assignmentGrade: "",
    assignmentCategory: ""
  })

  console.log(assignmentFormInput);

  // States controlling displayed content
  const [newAssignmentFormShown, setNewAssignmentFormShown] = useState(false);

  // console.log(assignmentName)
  // console.log(assignmentGrade)
  // console.log(assignmentCategory)

  // Get route parameters
  const params = useParams(); // {classID: 01, studentID: 01}

  // Fetch grade data for class and student viewed
  useEffect(() => {
    const getData = async () => {
      const data = await fetchGrades(params.classID, params.studentID)
      setGradeData(data);
    }
    getData();
  }, [])
  // console.log(gradeData);
  
  return (
    <Grid container spacing={10} columns={12} sx={{"display": "flex", "justifyContent": "center"}}>

      {/* Left side */}
      <Grid container direction="column" spacing={3} size={{ s: 14, md: 7}}>
        {/* Back Button */}
        <Button sx={{"backgroundColor": "#11578A", "color": "white", "width": 1/6}} startIcon={<ArrowBackIosIcon />} variant="contained">Back </Button>
        
        {/* Header */}
        <Grid container spacing={0.5} direction="column">
          <p>Class Name</p>
          <h2>[Student Name]'s Grades</h2>
        </Grid>


        {/* New Assignment Form */}
        {newAssignmentFormShown && 
        <Grid container sx={{"bgcolor": "#F5F3E4", padding: "4rem 2rem", "borderRadius": 2, "width": "auto", "display": "flex", "justifyContent": "space-between", "flexDirection": "column"}}>
         
         {/* Top */}
          <Grid container sx={{"display": "flex", "justifyContent": "space-between"}}>
            {/* Header */}
            <h2>New Assignment Grading</h2>

            {/* Hide Form Button */}
            <Button sx={{"backgroundColor": "#CE2626", "color": "white"}} variant="contained" startIcon={<DeleteIcon />}>Cancel</Button>
          </Grid>

          {/* Assignment Name Input */}
          <Grid container direction="column" spacing={1}>
            <InputLabel required="true" sx={{"fontSize": "1rem", color: "black"}}>Assignment Name</InputLabel>
            <TextField
              placeholder="Enter name..."
              value={assignmentFormInput.assignmentName}
              onChange={(e) => setAssignmentFormInput({...assignmentFormInput, assignmentName: e.target.value})}
              sx={{"flexGrow": "1", "bgcolor": "#FFFDEB", "borderRadius": 1}}
            />
          </Grid>
          
          {/* Grade Input */}
          <Grid container direction="column" spacing={1}>
            <Grid container direction="row" sx={{"display": "flex", "alignItems": "end"}}>
              <InputLabel required="true" sx={{"fontSize": "1rem", color: "black"}}>Grade</InputLabel>
              <Typography variant="body2" sx={{"display": "inline", color: "#858585"}}> (out of 100)</Typography>
            </Grid>
            <Grid columns={12} sx={{"display": "flex", "flexDirection": "row", "alignItems": "center"}}>
              <TextField
                placeholder="Between 0 and 100"
                value={assignmentFormInput.assignmentGrade}
                onChange={(e) => setAssignmentFormInput({...assignmentFormInput, assignmentGrade: e.target.value})}
                sx={{"flexGrow": "1", "bgcolor": "#FFFDEB", "borderRadius": 1, width: 1/10}}
              />
            </Grid>
          </Grid>
          
          {/* Category select input */}
          <Grid container direction="column" spacing={1}>
            <InputLabel required="true" sx={{"fontSize": "1rem", color: "black"}}>Category</InputLabel>
            <Select
              value={assignmentFormInput.assignmentCategory} //update to set to 1st category
              displayEmpty
              renderValue={(value) => {
                if (!value) {
                  return <Typography sx={{color:"#929292"}}>Select...</Typography>;
                }
                return <>{value}</>;
              }}
              onChange={(e) => setAssignmentFormInput({...assignmentFormInput, assignmentCategory: e.target.value})}
              sx={{"width": 1/3}}
            >
              <MenuItem value={10}>Ten</MenuItem>
              <MenuItem value={20}>Twenty</MenuItem>
              <MenuItem value={30}>Thirty</MenuItem>
            </Select>
          </Grid>

          {/* Submit Button */}
          <Button sx={{"backgroundColor": "#11578A", "color": "white", "width": 1/3}} endIcon={<SendIcon />} variant="contained">Submit </Button>
        </Grid>
        }




        {/* Add Assignments Button */}
        <Button sx={{"backgroundColor": "#11578A", "color": "white", "width": 1/3}} variant="contained" endIcon={<AddIcon />}
          onClick={() => setNewAssignmentFormShown(true)}
          >Add Assignment</Button>



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