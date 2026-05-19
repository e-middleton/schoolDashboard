import "../styling/ClassDirectory.css"

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

import Button from '@mui/material/Button';

import SearchIcon from '@mui/icons-material/Search';
import InputBase from '@mui/material/InputBase';


const ClassDirectory = () => {

  const classData = [
    {
      "name": "G3 Math",
      "teacher": "Ms. Anne Randoll",
      "image": ""
    },
    {
      "name": "G3 Math",
      "teacher": "Mr. Greg Gonzales",
      "image": ""
    },
    {
      "name": "[Class name]",
      "teacher": "Teacher name",
      "image": ""
    },
        {
      "name": "[Class name]",
      "teacher": "Teacher name",
      "image": ""
    },
        {
      "name": "[Class name]",
      "teacher": "Teacher name",
      "image": ""
    }
  ]

  return (
    <>
      {/* Header */}
      <h1>Class Directory</h1>

      {/* Search bar and add, delete buttons */}
      <SearchIcon />
      <InputBase
        placeholder="Search…"
        inputProps={{ 'aria-label': 'search' }}
      />
      <div className="classbuttons-div">
        <Button sx={{"background-color": "#11578A", "color": "white"}} variant="contained">Add Class</Button>
        <Button sx={{"background-color": "#11578A", "color": "white"}} variant="contained">Delete Class</Button>
      </div>


      {/* Grid of all classes */}
      <div className="classlist-div">
        {classData.map(aClass => (
          // Card background
          <Card sx={{ minWidth: 380 }}>

            <CardActionArea sx={{display: "flex", "flex-direction": "row", "justify-content": "space-between"}}>
              
              {/* Card text and button */}
              <CardContent sx={{padding: "2rem"}}>
                <Typography variant="h5" component="div">
                  {aClass.name}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {aClass.teacher}
                </Typography>
                <Button sx={{"background-color": "#11578A", "color": "white"}} variant="contained">View Dashboard</Button>
              </CardContent>
              
              {/* Card image */}
              <CardMedia
                component="img"
                height="220"
                image={aClass.image || "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/330px-Placeholder_view_vector.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail"}
                alt={`Image for ${aClass.name} class`}
                sx={{"width": 120}}
              />
            </CardActionArea>
          </Card>
        ))}
      </div>
    </>
  )
};

export default ClassDirectory;