import "../styling/ClassDirectory.css"

import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import ImageList from '@mui/material/ImageList';
import Grid from '@mui/material/Grid';
import { List, ListItem, ListItemText, Box, TextField, InputAdornment } from '@mui/material';


// Icons
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { collection, getDocs, addDoc, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import { stepClasses } from "@mui/material";
import ClassCard from "../components/ClassCard"
import { useState } from "react";
import { useEffect } from "react";

const ClassDirectory = () => {

  const [classes, setClasses] = useState([]);

  /* fetch class detail from database */
  const [searchName, setSearchName] = useState("");
  const navigate = useNavigate();


  const fetchClasses = async () => {
    try {
      const snapshot = await getDocs(collection(db, "classes"));

      const data = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      }));

      setClasses(data);
    } catch (err) {
      console.error("FIREBASE ERROR:", err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  const filteredClasses = classes.filter((c) =>
    c.className?.toLowerCase().includes(searchName.toLowerCase())
  );

  const handleAddClass = async () => {

    try {

      const newClass = {
        className: "New Class",
        studentIDs: [],
        teacherIDs: [],
        createdAt: new Date()
      };

      await addDoc(collection(db, "classes"), newClass);
      fetchClasses();

    } catch (err) {
      console.error("Error adding class:", err);
    }
  };

  const handleDeleteClass = async (classId) => {

    if (!classId) return;

    const confirmDelete = window.confirm("Delete this class?");
    if (!confirmDelete) return;

    try {

      await deleteDoc(doc(db, "classes", classId));
      fetchClasses();

    } catch (err) {
      console.error("Error deleting class:", err);
    }
  };

  return (

    <div className="classdirectory-div">
      {/* Header */}
      <h1>Class Directory</h1>

      {/* Search bar and add, delete buttons */}
      <div className="actions-div" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <Box component="form" sx={{ flexGrow: 1 }}>
          <TextField
            sx={{
              backgroundColor: "#fffdeb", // 统一的淡黄色背景
              borderRadius: "10px",
              boxShadow: "2px 2px 12px 1px #d2d2d2", // 统一的阴影
            }}
            fullWidth
            label="Search Class Name"
            placeholder="e.g. Mathematics"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') e.preventDefault();
            }}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <div className="classbuttons-div" style={{ display: 'flex', gap: '10px', alignItems: "center" }}>
          <Button
            sx={{ backgroundColor: "#11578A", color: "white" }}
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddClass}
          >
            Add Class
          </Button>


        </div>
      </div>

      {/* Grid of all classes */}
      <ImageList cols={3} gap={8}>
        {filteredClasses.length > 0 ? (
          filteredClasses.map(c => (
            <ClassCard
              key={c.id}
              className={c.className}
              teacherName={c.teacherName}
              image={c.image}
              onView={() => navigate(`/class-directory/${c.id}`)}
              onDelete={() => handleDeleteClass(c.id)}
            />
          ))
        ) : (
          searchName && (
            <p style={{ padding: "20px", gridColumn: "1 / -1" }}>
              No classes found matching "{searchName}"
            </p>
          )
        )}
      </ImageList>
    </div>
  );
};

export default ClassDirectory;