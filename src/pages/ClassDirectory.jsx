import "../styling/ClassDirectory.css"

import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';

import ImageList from '@mui/material/ImageList';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { classes } from "../utils/classes";
import { useNavigate } from "react-router-dom";
import { stepClasses } from "@mui/material";
import ClassCard from "../components/ClassCard"

const ClassDirectory = () => {

  /*
  todo:
  - implement search -> filter by name
  - implement add class -> nav
  - implement delete class -> option to select classes to delete
  - implement view dashboard -> dynamically navigates to class page
  */

  /* navigate to detail class page */
  const navigate = useNavigate();

  return (
    <div className="classdirectory-div">
      {/* Header */}
      <h1>Class Directory</h1>

      <h2>You may notice that the card formatting looks a bit strange after the component change...</h2>
      <p>I will ensure to fix it in my next push on this branch! :D</p>

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
          <ClassCard
            key={aClass.id}
            className={aClass.className}
            teacherName={aClass.teacherName}
            image={aClass.image}
            onView={() =>
              navigate(`/class-directory/${aClass.id}`)
            }
          />
        ))}
      </ImageList>
    </div>
  )
};

export default ClassDirectory;