import { useParams } from 'react-router-dom';
import { useState } from "react";

import { calculateStudentAverage } from '../utils/gradeCalculations';

import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';


// Icons
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

import { fetchClassDocument } from "../utils/classes";
import { fetchAllPeople } from "../utils/people";
import { initializeGradesForClass, createGradeForStudent } from "../utils/gradeService";
import { useNavigate } from "react-router-dom";
import ClassCard from "../components/ClassCard"
import { useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const ClassDetail = () => {
    const { id } = useParams();


    /* navigate to grade management page */
	const navigate = useNavigate();

    const default_image = "https://elements-resized.envatousercontent.com/envato-dam-assets-production/EVA/TRX/5f/24/43/3b/86/v1_E10/E1042C7G.jpg?w=500&cf_fit=scale-down&mark-alpha=18&mark=https%3A%2F%2Felements-assets.envato.com%2Fstatic%2Fwatermark4.png&q=85&format=auto&s=6c9d85d29a12ab8b6c345c81d0e9cfba8e3f65525c4b177e460e89f82b2febd9"
    const notfound_image = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/330px-Placeholder_view_vector.svg.png"


    const [currentClass, setCurrentClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [teachers, setTeacher] = useState([]);
    const [classAverage, setClassAverage] = useState(0);
    const [grades, setGrades] = useState([]);
    const [search, setSearch] = useState("");

    // fetch current class
    useEffect(() => {
        const fetchClass = async () => {
            // note: id is the class document's id
            const classDocument = await fetchClassDocument(id)
            setCurrentClass(classDocument);
        };

        fetchClass();
    }, [id]);

    console.log(students);

    //fetch students of current class
    useEffect(() => {
        const fetchStudents = async () => {
            if (!currentClass?.studentIDs) return;

            const allStudents = await fetchAllPeople("students");
            const classStudents = allStudents.filter(s => currentClass.studentIDs.includes(s.id));

            // console.log(classStudents);

            const studentAverages = await Promise.all(classStudents.map(student => (calculateStudentAverage(id, student.id))));
            setStudents(classStudents.map((studentData, i) => ({
                ...studentData,
                studentAverage: studentAverages[i]
            })));

            // derive class average from the student averages
            const filtered = studentAverages.filter(a => a !== null);
            const classAverage = filtered.length === 0 ?
                (null) : (filtered.reduce((sum, a) => sum + parseFloat(a), 0) / filtered.length).toFixed(1);
            setClassAverage(classAverage);
        };

        fetchStudents();
    }, [currentClass]);

    // fetch grades of students of current class
    useEffect(() => {
        const fetchGrades = async () => {
            const snapshot = await getDocs(collection(db, "grades"));

            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setGrades(data);
        };

        fetchGrades();
    }, []);

    // fetch teacher(s) of current class
    useEffect(() => {
        const fetchTeacher = async () => {
            if (!currentClass?.teacherID) return;

            const snapshot = await getDocs(collection(db, "teachers"));

            const classTeacher = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })
            ).filter(t => currentClass.teacherID.includes(t.id));

            setTeacher(classTeacher);
        };

        fetchTeacher();
    }, [currentClass]);

    if (!currentClass) {
        return <div>Class not found</div>
    }

    const filteredGrades = grades.filter((g) => { return String(g.studentID).includes(search); });


    const getGradeByStudent = (studentID) => {
        return grades.find(g => g.studentID === studentID);
    };

    if (students.length === 0) {
        return <p>No students in this class.</p>
    }

    // search filter 
    const filteredStudents = students.filter((student) => `${student.firstName} ${student.lastName}`
        .toLowerCase().includes(search.toLowerCase()));



    return (
        <Grid container spacing={4} sx={{ padding: "2rem" }} className="classdetail">

            {/*left side */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Box >
                    <img
                        src={default_image || notfound_image}
                        style={{ width: "100%", borderRadius: "8px" }}
                    />

                    <div style={{ marginTop: "1rem", display: "flex", flexDirection: "column", alignItems: "space-between", justifyContent: "center" }}>
                        <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 600, color: '#11578A' }}>
                                {currentClass.className}
                            </h2>
                            <Button sx={{ "backgroundColor": "#11578A", "color": "white", whiteSpace: "npwrap", ml: 2 }} variant="contained">
                                Edit Class Info
                            </Button>
                        </div>

                        {/* Average class grade */}
                        <div style={{ marginTop: "0.5rem" }}>
                            <h3>Average Grade: {classAverage ? `${classAverage}%` : ("N/A")}</h3>
                        </div>
                    </div>

                    {/* Teacher Card */}
                    <Card sx={{ marginTop: "2rem", backgroundColor: "#FFFDEB" }}>
                        {teachers.map((t) => (
                            <CardContent key={t.id}>
                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                    <Typography variant="h5">
                                        <span>{t.firstName} {t.lastName}</span>
                                    </Typography>
                                </div>

                            </CardContent>
                        )
                        )}
                    </Card>
                </Box>
            </Grid>

            {/*right side */}
            <Grid size={{ xs: 12, md: 8 }}>
                <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: "0.5rem", mb: 2, backgroundColor: "#D3D3D3", borderRadius: "4px", px: 1 }}>
                        <div className="search-bar">
                            <SearchIcon />
                            <InputBase
                                placeholder="Search for student by name…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                sx={{ flexGrow: "1" }}
                            />
                        </div>
                    </Box>
                </Box>



                <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
                    <Button sx={{ "backgroundColor": "#11578A", "color": "white" }} variant="contained" startIcon={<AddIcon />}>Add Student</Button>
                    <Button sx={{ "backgroundColor": "#CE2626", "color": "white" }} variant="contained" startIcon={<DeleteIcon />}>Delete Student</Button>
                </div>
                        
                <div style={{ marginTop: "2rem" }}>
                    {filteredStudents.length === 0 ? (
                        <p>No Students Found.</p>) : (
                            filteredStudents.map((s) => {
                                const g = getGradeByStudent(s.id);

                                return (
                                    <Card key={s.id} sx={{ backgroundColor: "#FFFDE8", mb: 2 }}>
                                    <CardContent>
                                        <div style={{ display: "flex", justifyContent: "space-between" }}>
											<span>{s.firstName || s.id}{" "}{s.lastName || s.id}</span>

											<div style={{display: "flex", gap: "1rem", "alignItems": "center"}}>
												<span> {s.studentAverage ? `Avg: ${s.studentAverage}%` : "No grades yet."}</span>
												<Button onClick={() => navigate(`/grades/${currentClass.id}/${s.id}`)}
													sx={{ "backgroundColor": "#11578A", "color": "white" }} variant="contained">Edit Grades</Button>
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