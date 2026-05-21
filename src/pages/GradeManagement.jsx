import "../styling/GradeManagement.css"
import { fetchGradeDocument, createGradeDocument } from "../utils/grades.js"

import GradeForm from "../components/GradeForm.jsx"
import AccordianDropdown from "../components/AccordianDropdown.jsx"

import { useState, useEffect } from 'react'
import { useParams } from 'react-router'

import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Typography from '@mui/material/Typography';

// Icons
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';

const GradeManagement = () => {
  
  /*
  todo:
  - (done) refactor components
      - (done) removed unused mui imports
  - add comments

  - interactive
    - (done) dynamically show category and grades
    - (done) dynamically show category in options for new grade
    - (done) show and hide new grade
  - validate grade input; error message
    - make all fields required
    - prevent typing non-numbers
    - assignment name
  - (done) success state, clear form

  ----------
  - edit grade
  - delete grade
  - navigation: params, back button (class page), need to know which class came from
  - get + display class name, class ID
  -----------
  - ignore: grade calculation algorithm
  if time: add search bar for assignments (?)
  */

  const params = useParams(); // {classID: 01, studentID: 01}

  // Grades for the student and class being viewed
  const [gradeData, setGradeData] = useState({});
  const [refreshToggle, setRefreshToggle] = useState(false); // triggers refresh on data update

  // States controlling displayed content
  const [gradeFormShown, setGradeFormShown] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch grade data for class and student viewed
  useEffect(() => {
    const getData = async () => {
      const data = await fetchGradeDocument(params.classID, params.studentID)
      setGradeData(data);
    }
    getData();
  }, [refreshToggle])

  // console.log("params");
  // console.log(params);

  // console.log("grade document");
  console.log(gradeData);
  
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


        {/* Grade Form */}
        {gradeFormShown && 
          <GradeForm closeForm={() => {setGradeFormShown(false)}}
            refreshToggle={refreshToggle}
            setRefreshToggle={setRefreshToggle}
            message={message}
            setMessage={setMessage}
          />
        }

        {/* Add Grade Button */}
        {!gradeFormShown &&
          <>
            <Button sx={{"backgroundColor": "#11578A", "color": "white", "width": 1/3}} variant="contained" endIcon={<AddIcon />}
            onClick={() => {setGradeFormShown(true); setMessage("")}}>
              Add Grade
            </Button>
            {
              message && <Typography variant="body2" sx={{color: "green"}}>{message}</Typography>
            }
          </>
        }

        {/* List of Accordians for Grade Categories */}
        <Grid container spacing={1}>
          {/* Quizzes */}
          <AccordianDropdown label={"Quizzes"} contentList={gradeData["quizGrades"]} setMessage={setMessage}/>
          
          {/* Participation */}
          <AccordianDropdown label={"Participation"} contentList={gradeData["participationGrades"]} setMessage={setMessage}/>
          
          {/* Projects */}
          <AccordianDropdown label={"Projects"} contentList={gradeData["projectGrades"]} setMessage={setMessage}/>
          
          {/* Tests */}
          <AccordianDropdown label={"Tests"} contentList={gradeData["testGrades"]} setMessage={setMessage}/>
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