import "../styling/ClassDirectory.css"

import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import ImageList from '@mui/material/ImageList';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { classes } from "../utils/classes";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { stepClasses } from "@mui/material";
import ClassCard from "../components/ClassCard"
import { useState } from "react";
import { useEffect } from "react";

const ClassDirectory = () => {

  const [classes, setClasses] = useState([]);

  /* navigate to detail class page */
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
  
        const snapshot = await getDocs(collection(db, "classes"));
  
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
  
  
        setClasses(data);
      } catch (err) {
        console.error("FIREBASE ERROR:", err);
      }
    };
  
    fetchClasses();
  }, []);

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
  {classes.map(c => (
    <ClassCard
      key={c.id}
      className={c.className}
      teacherName={c.teacherName}
      image={c.image}
      onView={() => navigate(`/class-directory/${c.id}`)}
    />
  ))}
</ImageList>
    </div>
  )
};

export default ClassDirectory;