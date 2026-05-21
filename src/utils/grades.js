import { doc, addDoc, deleteDoc, updateDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../../firebase.js";

// Fixed grade categories
const gradeCategories = ["Quizzes", "Participation", "Projects", "Tests"];

// Structure of grade document
const gradeStructure = {
  classID: "",
  studentID: "",
  participationGrades: [],
  quizGrades: [], // contains grade records ex. {assignmentID: , assignmentName: 'assignment1', assignmentGrade: 98}
  testGrades: [], // contains grade records
  projectGrades: [] // contains grade records
}

// Maps category to designated property in document
const categoryToProperty = {
  "Participation": "participationGrades",
  "Quizzes": "quizGrades",
  "Tests": "testGrades",
  "Projects": "projectGrades"
}

// retrieve all grade records from the database for a specified **class and **student
const fetchGradeDocument = async (targetClassID, targetStudentID) => {
  const querySnapshot = await getDocs(collection(db, "grades"));
  const parsedSnapshot = querySnapshot.docs.map((doc) => ({id: doc.id, ...doc.data()}));

  // Search by class and student
  const matchingGradeDocument = parsedSnapshot.find((grade) => 
    grade.classID == targetClassID && grade.studentID == targetStudentID);

  // if(matchingGradeDocument) {
  //   console.log("matching grade document found");
  //   console.log(matchingGradeDocument);
  // }
  // else {
  //   console.log("error: matching grade document not found")
  // }
  return matchingGradeDocument;
};


// create initial grade document
const createGradeDocument = async (targetClassID, targetStudentID) => {
  // if time: check that record doesn't already exist -> if does, prevent create
  const gradeDocument = await fetchGradeDocument(targetClassID, targetStudentID);
  // initial grade document doesn't exist
  if(gradeDocument) {
    console.log("error: failed to create grade document - already exists")
  }

  await addDoc(collection(db, "grades"), {
    ...gradeStructure,
    classID: targetClassID,
    studentID: targetStudentID
  })
}

// ------------add a new record to the grade document for a specified **class and **student
    // -> returns false if assignmentName already exists
const addGradeRecord = async (gradeRecord) => {
  // fetch all records matching selected class and student
  const gradeDocument = await fetchGradeDocument(gradeRecord.classID, gradeRecord.studentID);
  
  if(!gradeDocument) { // error: grade document doesn't exist
    console.log("error: initial grade document was never created")
  }

  // search for record with matching assignment name
  const categoryListName = categoryToProperty[gradeRecord.assignmentCategory];
  const matchingCategoryList = gradeDocument[categoryToProperty[gradeRecord.assignmentCategory]];
  const existingRecord = matchingCategoryList.some((record) => (
    record.assignmentName === gradeRecord.assignmentName
  )); 

  if (!existingRecord) { // proceed if no record exists with same name
    gradeDocument[categoryListName] = [
      ...matchingCategoryList,
      {
        assignmentID: crypto.randomUUID(),
        assignmentName: gradeRecord.assignmentName,
        assignmentGrade: gradeRecord.assignmentGrade
      }
    ]
    await updateDoc(doc(db, "grades", gradeDocument.id), gradeDocument)
    return true;
  }

  console.log(`add failed: record with name ${gradeRecord.name} already exists`);
  return false;
}


// ------------update a specified grade record
const updateGradeRecord = async (updatedRecord) => {
  // student, class -> document
  // category -> find matching assignmentID
    // update name, grade
      // fetch all records matching selected class and student

  const gradeDocument = await fetchGradeDocument(updatedRecord.classID, updatedRecord.studentID);
  if(!gradeDocument) { // initial grade document doesn't exist
    console.log("error: initial grade document was never created")
  }

  // list of all assignments in specified category
  const categoryListName = categoryToProperty[updatedRecord.assignmentCategory];
  const matchingCategoryList = gradeDocument[categoryToProperty[updatedRecord.assignmentCategory]];

  const updatedCategoryList = matchingCategoryList.map((record) => { // update specified grade record
    record.assignmentID === updatedRecord.assignmentID ? ({...updatedRecord}) : ({...record})
  })
  gradeDocument[categoryListName] = updatedCategoryList

  await updateDoc(doc(db, "grades", gradeDocument.id), gradeDocument)
}


// ------------delete a specified grade record
const deleteGradeRecord = async (gradeRecord) => {
  console.log(gradeRecord);
  const gradeDocument = await fetchGradeDocument(gradeRecord.classID, gradeRecord.studentID);
  // initial grade document doesn't exist
  if(!gradeDocument) {
    console.log("error: initial grade document was never created")
  }

  // retrieve list of assignments in same category
  const categoryListName = categoryToProperty[gradeRecord.assignmentCategory];
  const matchingCategoryList = gradeDocument[categoryToProperty[gradeRecord.assignmentCategory]];

  // delete record with matching ID
  const updatedCategoryList = matchingCategoryList.filter(record => (record.assignmentID !== gradeRecord.assignmentID));
  gradeDocument[categoryListName] = updatedCategoryList

  await updateDoc(doc(db, "grades", gradeDocument.id), gradeDocument)
}

export { gradeCategories, 
  fetchGradeDocument, createGradeDocument, addGradeRecord, updateGradeRecord, deleteGradeRecord };