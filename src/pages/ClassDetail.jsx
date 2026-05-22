import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from "react";

import { calculateStudentAverage } from '../utils/gradeCalculations';
import { fetchClassDocument } from "../utils/classes";
import { fetchAllPeople, updatePerson } from "../utils/people";

import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';

import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { collection, getDocs, getDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase";

const ClassDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const default_image = "https://elements-resized.envatousercontent.com/envato-dam-assets-production/EVA/TRX/5f/24/43/3b/86/v1_E10/E1042C7G.jpg?w=500&cf_fit=scale-down&mark-alpha=18&mark=https%3A%2F%2Felements-assets.envato.com%2Fstatic%2Fwatermark4.png&q=85&format=auto&s=6c9d85d29a12ab8b6c345c81d0e9cfba8e3f65525c4b177e460e89f82b2febd9"
    const notfound_image = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/330px-Placeholder_view_vector.svg.png"

    const [currentClass, setCurrentClass] = useState(null);
    const [allStudents, setAllStudents] = useState([]);
    const [students, setStudents] = useState([]);
    const [teachers, setTeacher] = useState([]);
    const [classAverage, setClassAverage] = useState(0);
    const [grades, setGrades] = useState([]);
    const [search, setSearch] = useState("");
    const [isAddingStudent, setIsAddingStudent] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState(null);

    useEffect(() => {
        const fetchClass = async () => {
            const classDocument = await fetchClassDocument(id);
            setCurrentClass(classDocument);
        };
        fetchClass();
    }, [id]);

    useEffect(() => {
        const fetchStudents = async () => {
            if (!currentClass) return;

            const fetchedStudents = await fetchAllPeople("students");
            setAllStudents(fetchedStudents);

            const classStudents = fetchedStudents.filter(s => currentClass.studentIDs?.includes(s.id));

            const studentAverages = await Promise.all(
                classStudents.map(s => calculateStudentAverage(id, s.id))
            );

            setStudents(classStudents.map((s, i) => ({
                ...s,
                studentAverage: studentAverages[i]
            })));

            const filtered = studentAverages.filter(a => a !== null);
            const avg = filtered.length
                ? (filtered.reduce((x, y) => x + parseFloat(y), 0) / filtered.length).toFixed(1)
                : null;

            setClassAverage(avg);
        };

        fetchStudents();
    }, [currentClass]);

    useEffect(() => {
        const fetchGrades = async () => {
            const snapshot = await getDocs(collection(db, "grades"));
            setGrades(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
        };
        fetchGrades();
    }, []);

    useEffect(() => {
        const fetchTeacher = async () => {
            if (!currentClass?.teacherID) return;

            const snapshot = await getDocs(collection(db, "teachers"));
            const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));

            setTeacher(data.filter(t => currentClass.teacherID.includes(t.id)));
        };
        fetchTeacher();
    }, [currentClass]);

    const getGradeByStudent = (studentID) => grades.find(g => g.studentID === studentID);

    const handleEditClass = async () => {
        const newName = prompt("Enter new class name: ", currentClass.className);
        const newTeacher = prompt("Enter new class teacher id: ", currentClass.teacherIDs[0] ? currentClass.teacherIDs[0] : "no teacher assigned");

        if (!newName) return;

        await updateDoc(doc(db, "classes", id), {
            className: newName,
            teacherIDs: [newTeacher]
        });

        setCurrentClass({ ...currentClass, className: newName, teacherIDs: [newTeacher] });
    };

    const handleAddStudent = async () => {
        if (!selectedStudent || !currentClass) return;

        if ((currentClass.studentIDs || []).includes(selectedStudent.id)) {
            setIsAddingStudent(false);
            setSelectedStudent(null);
            return;
        }

        const updated = {
            ...currentClass,
            studentIDs: [...(currentClass.studentIDs || []), selectedStudent.id]
        };

        await updateDoc(doc(db, "classes", id), {
            studentIDs: updated.studentIDs
        });

        // update student doc
        const docRef = await getDoc(doc(db, "students", selectedStudent.id));
        const student = { id: docRef.id, ...docRef.data() };
        student.classIDs.push(currentClass.id);
        updatePerson("students", student);

        setCurrentClass(updated);
        setIsAddingStudent(false);
        setSelectedStudent(null);
    };

    const handleDeleteStudent = async (studentID) => {
        if (!currentClass) return;

        const updated = {
            ...currentClass,
            studentIDs: (currentClass.studentIDs || []).filter(s => s !== studentID)
        };

        await updateDoc(doc(db, "classes", id), {
            studentIDs: updated.studentIDs
        });

        setCurrentClass(updated);
    };

    const filteredStudents = students.filter(s =>
        `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase())
    );

    const studentsToAdd = allStudents.filter((student) => !(currentClass?.studentIDs || []).includes(student.id));

    if (!currentClass) return <div>Class not found</div>;

    return (
        <Grid container spacing={4} sx={{ padding: "2rem" }}>

            <Grid size={{ xs: 12, md: 4 }}>
                <Box>
                    <img src={default_image || notfound_image} style={{ width: "100%", borderRadius: "8px" }} />

                    <div style={{ marginTop: "1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 600, color: '#11578A' }}>
                                {currentClass.className}
                            </h2>
                            <Button onClick={handleEditClass} sx={{ backgroundColor: "#11578A", color: "white" }}>
                                Edit Class Info
                            </Button>
                        </div>

                        <h3>Average Grade: {classAverage ? `${classAverage}%` : "N/A"}</h3>
                    </div>

                    <Card sx={{ marginTop: "2rem", backgroundColor: "#FFFDEB" }}>
                        {teachers.map(t => (
                            <CardContent key={t.id}>
                                <Typography variant="h5">
                                    {t.firstName} {t.lastName}
                                </Typography>
                            </CardContent>
                        ))}
                    </Card>
                </Box>
            </Grid>

            <Grid size={{ xs: 12, md: 8 }}>
                <Box sx={{ display: "flex", gap: 1, mb: 2, backgroundColor: "#D3D3D3", p: 1, borderRadius: 1 }}>
                    <SearchIcon />
                    <InputBase value={search} onChange={(e) => setSearch(e.target.value)} fullWidth />
                </Box>

                <div style={{ display: "flex", gap: "1rem" }}>
                    <Button onClick={() => setIsAddingStudent((current) => !current)} sx={{ backgroundColor: "#11578A", color: "white" }} startIcon={<AddIcon />}>
                        Add Student
                    </Button>
                </div>

                {isAddingStudent ? (
                    <Box sx={{ mt: 2, mb: 2, maxWidth: 420 }}>
                        <Autocomplete
                            options={studentsToAdd}
                            getOptionLabel={(option) => `${option.firstName || ''} ${option.lastName || ''}`.trim() || option.id}
                            value={selectedStudent}
                            onChange={(_, newValue) => setSelectedStudent(newValue)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search students to add"
                                    placeholder="Type a name..."
                                />
                            )}
                            sx={{ mb: 1 }}
                        />
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                onClick={handleAddStudent}
                                disabled={!selectedStudent}
                                sx={{
                                    backgroundColor: "white",
                                    color: "#11578A",
                                    border: "1px solid #11578A",
                                    '&.Mui-disabled': {
                                        backgroundColor: "white",
                                        color: "#9CA3AF",
                                        borderColor: "#D1D5DB",
                                    },
                                }}
                            >
                                Add Selected Student
                            </Button>
                            <Button
                                onClick={() => {
                                    setIsAddingStudent(false);
                                    setSelectedStudent(null);
                                }}
                                variant="outlined"
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>
                ) : null}

                <div style={{ marginTop: "2rem" }}>
                    {filteredStudents.length === 0 ? (
                        <p>No Students in this class.</p>
                    ) : (
                        filteredStudents.map(s => {
                            const g = getGradeByStudent(s.id);

                            return (
                                <Card key={s.id} sx={{ backgroundColor: "#FFFDE8", mb: 2 }}>
                                    <CardContent>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                                            <span>{s.firstName} {s.lastName}</span>

                                            <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                                                <span>{s.studentAverage ? `Avg: ${s.studentAverage}%` : "No grades yet"}</span>

                                                <Button onClick={() => navigate(`/grades/${id}/${s.id}`)} sx={{ backgroundColor: "#11578A", color: "white" }}>
                                                    Edit Grades
                                                </Button>

                                                <Button onClick={() => handleDeleteStudent(s.id)} sx={{ backgroundColor: "#CE2626", color: "white" }}>
                                                    <DeleteIcon />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </div>
            </Grid>
        </Grid>
    );
};

export default ClassDetail;