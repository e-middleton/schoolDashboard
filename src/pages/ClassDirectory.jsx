import "../styling/ClassDirectory.css"

import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import ImageList from '@mui/material/ImageList';
import Grid from '@mui/material/Grid';
import { Box, TextField, InputAdornment } from '@mui/material';

import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { collection, getDocs, addDoc, deleteDoc, doc } from "firebase/firestore";
import { db } from "../../firebase";

import { useNavigate } from "react-router-dom";
import ClassCard from "../components/ClassCard";
import { useState, useEffect } from "react";

const ClassDirectory = () => {

  const [classes, setClasses] = useState([]);
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

  const filteredClasses = classes.filter((c) =>
    c.className?.toLowerCase().includes(searchName.toLowerCase())
  );

  return (

    <div className="classdirectory-div">
      <h1>Class Directory</h1>

      <div className="actions-div" style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>

        <Box sx={{ flexGrow: 1 }}>
          <TextField
            fullWidth
            label="Search Class Name"
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

        <Button
          sx={{ backgroundColor: "#11578A", color: "white" }}
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddClass}
        >
          Add Class
        </Button>

      </div>

      <ImageList cols={3} gap={8}>

        {filteredClasses.length > 0 ? (
          filteredClasses.map(c => (
            <div key={c.id} style={{ position: "relative" }}>

              <ClassCard
                className={c.className}
                teacherName={c.teacherName}
                image={c.image}
                onView={() => navigate(`/class-directory/${c.id}`)}
              />

              <Button
                onClick={() => handleDeleteClass(c.id)}
                sx={{
                  position: "absolute",
                  top: 10,
                  right: 10,
                  backgroundColor: "#CE2626",
                  color: "white",
                  minWidth: "30px"
                }}
              >
                <DeleteIcon />
              </Button>

            </div>
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
  )
};

export default ClassDirectory;