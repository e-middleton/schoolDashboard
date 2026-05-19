import "../styling/ClassDirectory.css"

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import CardActionArea from '@mui/material/CardActionArea';

import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';

import ImageList from '@mui/material/ImageList';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import classes from "../utils/classes";

const ClassDirectory = () => {

  
  /*
  todo:
  - implement search -> filter by name
  - implement add class -> nav
  - implement delete class -> option to select classes to delete
  - implement view dashboard -> dynamically navigates to class page
  */

  return (
    <div className="classdirectory-div">
      {/* Header */}
      <h1>Class Directory</h1>

      {/* Search bar and add, delete buttons */}
      <div className="actions-div">
        <div className="search-bar">
          <SearchIcon />
          <InputBase
            placeholder="Search for class by name…"
            inputProps={{ 'aria-label': 'search' }}
            sx={{"flexGrow": "1"}}
          />
        </div>
        <div className="classbuttons-div">
          <Button sx={{"backgroundColor": "#11578A", "color": "white"}} variant="contained" startIcon={<AddIcon />}>Add Class</Button>
          <Button sx={{"backgroundColor": "#CE2626", "color": "white"}} variant="contained" startIcon={<DeleteIcon />}>Delete Class</Button>
        </div>
      </div>

      {/* Grid of all classes */}
      <ImageList cols={3} gap={8}>
        {classes.map(aClass => (
          // Card background
          <Card sx={{ "backgroundColor": "#FFFDEB"}}>

            <CardActionArea sx={{display: "flex", "flexDirection": "row", "justifyContent": "space-between"}}>
              
              {/* Card text and button */}
              <CardContent sx={{padding: "2rem"}}>
                <Typography variant="h5" component="div">
                  {aClass.className}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  {aClass.teacherName}
                </Typography>
                <Button sx={{"backgroundColor": "#11578A", "color": "white"}} variant="contained">View Dashboard</Button>
              </CardContent>
              
              {/* Card image */}
              <CardMedia
                component="img"
                height="220"
                image={aClass.image || "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/330px-Placeholder_view_vector.svg.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=thumbnail"}
                alt={`Image for ${aClass.className} class`}
                sx={{"width": 120}}
              />
            </CardActionArea>
          </Card>
        ))}
      </ImageList>
    </div>
  )
};

export default ClassDirectory;