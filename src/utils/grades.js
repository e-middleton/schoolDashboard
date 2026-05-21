import { doc, addDoc, deleteDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase.js";

/*
grades:
{
  classID: 01
  studentID: 01
  participationGrades: [
    {
      day1: 100
    }
  ]
  quizGrades: [
    {
      ...
    }
  ]
  testGrades...
  projectGrades...
}
*/



// retrieve grade records from the database
  // for a specified **class and **student
const fetchGrades = async (targetClassID, targetStudentID) => {
  const querySnapshot = await getDocs(collection(db, "grades"));
  const parsedSnapshot = querySnapshot.docs.map((doc) => ({...doc.data()}));

  // Filter by class and student
  return parsedSnapshot.filter((grade) => 
    grade.classID === targetClassID && grade.studentID === targetStudentID);
};

// add a new grade to the database

const addGrade = async (grade) => {
//   await addDoc(collection(db, "grades", classID), {
//     classID: grade.classID,
//     studentID: grade.studentID,
//     quizGrades: grade.quizGrades,
//     projectGrades: grade.projectGrades,
//     participationGrades: grade.participationGrades,
//     testGrades: grade.testGrades
//   })
}

// -----------

const updateGrade = async () => {

}

const deleteGrade = async () => {

}

export { fetchGrades, addGrade, updateGrade, deleteGrade };