import { useParams } from 'react-router-dom';
import { useState } from "react";
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
import { initializeGradesForClass, createGradeForStudent } from "../utils/gradeService";
import { useNavigate } from "react-router-dom";
import ClassCard from "../components/ClassCard"
import { useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";

const ClassDetail = () => {
    const { id } = useParams();

    const default_image = "https://elements-resized.envatousercontent.com/envato-dam-assets-production/EVA/TRX/5f/24/43/3b/86/v1_E10/E1042C7G.jpg?w=500&cf_fit=scale-down&mark-alpha=18&mark=https%3A%2F%2Felements-assets.envato.com%2Fstatic%2Fwatermark4.png&q=85&format=auto&s=6c9d85d29a12ab8b6c345c81d0e9cfba8e3f65525c4b177e460e89f82b2febd9"
    const notfound_image = "https://upload.wikimedia.org/wikipedia/commons/thumb/3/3f/Placeholder_view_vector.svg/330px-Placeholder_view_vector.svg.png"


    const [currentClass, setCurrentClass] = useState(null);
    const [students, setStudents] = useState([]);
    const [teachers, setTeacher] = useState([]);
    const [grades, setGrades] = useState([]);
    const [search, setSearch] = useState("");

    {/* fetch current class*/ }
    useEffect(() => {
        const fetchClass = async () => {
            const snapshot = await getDocs(collection(db, "classes"));

            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            const found = data.find(c => c.id === id);

            setCurrentClass(found);
        };

        fetchClass();
    }, [id]);

    {/* fetch students of current class*/ }
    useEffect(() => {
        const fetchStudents = async () => {
            if (!currentClass?.studentIDs) return;

            const snapshot = await getDocs(collection(db, "students"));

            const classStudents = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })
            ).filter(s => currentClass.studentIDs.includes(s.id));

            setStudents(classStudents);
        };

        fetchStudents();
    }, [currentClass]);

    {/* fetch grades of students of current class*/ }
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

    {/* fetch teacher(s) of current class*/ }
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

    const calculateStudentAverage = (g) => {
        if (!g) return 0;

        const all = [
            ...(g.quizGrades),
            ...(g.testGrades),
            ...(g.projectGrades),
            ...(g.participationGrades)
        ].map(Number);

        if (all.length === 0) return 0;

        const sum = all.reduce((a, b) => a + b, 0);

        return (sum / all.length).toFixed(1);
    };

    const filteredGrades = grades.filter((g) => { return String(g.studentID).includes(search); });

    const classAverage = grades.length === 0
        ? 0
        : (
            grades.reduce((sum, g) => {
                return sum + Number(calculateStudentAverage(g));
            }, 0) / grades.length
        ).toFixed(1);


    const getGradeByStudent = (studentID) => {
        return grades.find(g => g.studentID === studentID);
    };

    if (student.length === 0) {
        return <p>No students in this class.</p>
    }

    return (
        <Grid container spacing={4} sx={{ padding: "2rem" }} className="classdetail">

            {/* left side */}
            <Grid size={{ xs: 12, md: 4 }}>
                <Box >
                    <img
                        src={default_image || notfound_image}
                        style={{ width: "100%", borderRadius: "8px" }}
                    />

                    <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <h2 style={{ margin: 0, fontSize: "2rem", fontWeight: 600, color: '#11578A' }}>
                            {currentClass.className}
                        </h2>
                        <Button sx={{ "backgroundColor": "#11578A", "color": "white", whiteSpace: "npwrap", ml: 2 }} variant="contained">
                            Edit Class Info
                        </Button>
                    </div>

                    {/* teacher card */}
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

                    {/* Todo: calculate average grade based on all students */}
                    {/* Average class grade */}
                    <div style={{ marginTop: "2rem" }}>
                        <h3>Average Grade: {classAverage}</h3>
                    </div>
                </Box>
            </Grid>

            {/* right side */}
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
                    {students.map((s) => {
                        const g = getGradeByStudent(s.id);

                        return (
                            <Card key={s.id} sx={{ backgroundColor: "#FFFDEB", mb: 2 }}>
                                <CardContent>
                                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                                        {/* student info */}
                                        <span>{s.firstName || s.id} {s.lastName || s.id}</span>

                                        {/* grade */}
                                        <span>
                                            Avg: {calculateStudentAverage(g)}
                                        </span>

                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

            </Grid>
        </Grid>
    )

};



export default ClassDetail;