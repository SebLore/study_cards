let questions = [];
let currentIndex = 0;
let score = 0;
let results = [];
let answerStats = {};
const questionsList = [];

/**
 * This function is called when the page is loaded and is responsible for initializing the application.
 * 
 * It loads the course data from the server, populates the course picker, and sets up event listeners.
 */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const data = await loadData();
    if (!data) throw new Error("Failed to load data");

    console.log("Data loaded:", data);
    const coursesMap = populateCourseMap(data);

    showSpinner(false);
    if (!loadSavedSelection(coursesMap)) {
      showSplashPage();
    }
    else {
      populateCoursePicker(coursesMap);
    }
  } catch (error) {
    console.error("Error during initialization:", error);
    displayErrorMessage("Failed to load course data. Please try reloading the page.");
  }
});

/**
 * 
 * @returns {Promise<Object>} The parsed JSON data from the server
 */
async function loadData() {
  try {
    const response = await fetch("data.json");
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Error loading questions:", error);
    return null;
  }
}

/**
 * 
 * @param {Object} data The parsed JSON data from the server
 * @returns {Object} A map of courses with their topics and questions
 * 
 * Populates a map of courses with their topics and questions from the data. 
 */

function populateCourseMap(data) {
  return data.courses.reduce((map, course) => {
    map[course.id] = {
      name: course.name,
      topics: course.topics.reduce((topicMap, topic) => {
        topicMap[topic.id] = {
          name: topic.name,
          questions: Object.fromEntries(topic.questions.map(q => [q.id, q]))
        };
        return topicMap;
      }, {})
    };
    return map;
  }, {});
}

/**
 * 
 * @param {Object} coursesMap A map of courses with their topics and questions
 * 
 * Populates the course picker with the courses from the coursesMap and sets up event listeners.
 *  
 * The course picker should be populated with the course id and name, e.g. "CSC101 - Introduction to Programming".
 * 
 * When a course is selected, the topic picker should be populated with the topics from the selected course.
 * 
 * When a topic is selected, the questions list should be updated with the questions from the selected topic.
 * 
 * When the start button is clicked, the course and topics are locked in and the first question should be loaded.
 * 
 */
function populateCoursePicker(coursesMap) {
  try {
    const coursePicker = document.getElementById("course-picker");
    const topicPicker = document.getElementById("topic-picker");
    const startButton = document.getElementById("course-picker-btn");

    Object.entries(coursesMap).forEach(([courseId, course]) => {
      const option = new Option(`${courseId} - ${course.name}`, courseId);
      coursePicker.appendChild(option);
    });

    coursePicker.addEventListener("change", () => updateTopicPicker(coursePicker.value, coursesMap, topicPicker));
    topicPicker.addEventListener("change", () => updateQuestionsList(coursePicker.value, topicPicker.value, coursesMap));
    startButton.addEventListener("click", () => {
      loadQuestion();
      showSpinner(false);
      showContent();
    });
  } catch (error) {
    console.error("Error populating course picker:", error);
  }
}

/**
 * 
 * @param {string} courseId The selected course id, i.e. DV1506 or MA1444 
 * @param {Object} coursesMap A map of courses with their topics and questions
 * @param {HTMLSelectElement} topicPicker The topic select element in the DOM
 * @returns 
 */
function updateTopicPicker(courseId, coursesMap, topicPicker) {
  const course = coursesMap[courseId];
  if (!course) return;

  topicPicker.innerHTML = "";
  topicPicker.appendChild(new Option("All Topics", "all"));

  Object.entries(course.topics).forEach(([topicId, topic]) => {
    topicPicker.appendChild(new Option(topic.name, topicId));
  });

  localStorage.setItem("selectedCourse", courseId);
}

/**
 * 
 * @param {string} courseId The selected course id, i.e. DV1506 or MA1444 
 * @param {Object} coursesMap A map of courses with their topics and questions
 * @param {HTMLSelectElement} topicPicker The topic select element in the DOM
 * @returns 
 */
function updateQuestionsList(courseId, topicId, coursesMap) {
  const course = coursesMap[courseId];
  if (!course) return;

  questionsList.length = 0;

  if (topicId === "all") {
    Object.values(course.topics).forEach(topic => {
      questionsList.push(...Object.values(topic.questions));
    });
  } else {
    questionsList.push(...Object.values(course.topics[topicId].questions));
  }

  localStorage.setItem("selectedTopic", topicId);
}

/**
 * 
 * @param {Object} coursesMap A map of courses with their topics and questions
 * 
 * Checks if there is a saved course and topic in localStorage and loads the saved selection. 
 * @returns {boolean} True if a saved selection was loaded, false otherwise
 */
function loadSavedSelection(coursesMap) {
  const savedCourse = localStorage.getItem("selectedCourse");
  const savedTopic = localStorage.getItem("selectedTopic");
  if (!savedCourse || !coursesMap[savedCourse]) {
    return false;
  }

  document.getElementById("course-picker").value = savedCourse;
  updateTopicPicker(savedCourse, coursesMap, document.getElementById("topic-picker"));
  document.getElementById("topic-picker").value = savedTopic || "all";

  setupQuestions();

  showSplashPage(false);
  showSpinner(false);
  showContent();

  return true;
}

/**
 *  
 * 
 * Loads the current question into the DOM and displays it to the user.
 * 
 * The question text should be displayed in the question element.
 * 
 * The hint text should be displayed in the hint element.
 * 
 * The options should be displayed in the options element as div elements with the class "option".
 * 
 * When an option is clicked, the selectAnswer function should be called with the index of the selected answer.
 * 
 * The selected option should have the class "selected" added to it.
 * 
 * The question type determines how the options are displayed:
 * 
 * - "multiple-choice": Display the options as div elements with the class "option".
 * - "true-false": Display two div elements with the text "True" and "False".
 * - "written": Display a text input element for the user to type in their answer.
 * - "short-answer": Display a text input element for the user to type in their answer.
 * - "multiple-select": Display the options as div elements with the class "option".
 * - "matching": Display the options as div elements with the class "option".
 * 
 */

function loadQuestion() {
  try {
    const question = questionsList[currentIndex];
    document.getElementById("question").textContent = question.text;
    document.getElementById("hint").textContent = question.hint;
    document.getElementById("hint").classList.add("hidden");

    const optionsElement = document.getElementById("options");
    optionsElement.innerHTML = "";

    if (question.type === "multiple-choice") {
      question.answers.forEach((answer, index) => {
        const option = document.createElement("div");
        option.classList.add("option");
        option.textContent = answer.text;
        option.onclick = () => selectAnswer(index);
        optionsElement.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Error loading question:", error);
  }
}

/**
 * 
 * @param {boolean} show Whether to show or hide the splash page
 */
function showSplashPage(show = true) {
  document.getElementById("splash-page").style.display = show ? "flex" : "none";
}

function showContent(show = true) {
  document.getElementById("content").style.display = show ? "flex" : "none";
}

function showSpinner(show = true) {
  document.getElementById("spinner").style.display = show ? "flex" : "none";
}

/**
 * 
 * @param {string} message The error message to display
 */
function displayErrorMessage(message) {
  const errorMessage = document.createElement("h1");
  errorMessage.style.color = "red";
  errorMessage.style.textAlign = "center";
  errorMessage.textContent = message;
  document.body.appendChild(errorMessage);
}

/**
 * 
 * @param {number} index The index of the selected answer 
 */
function selectAnswer(index) {
  document.querySelectorAll(".option").forEach((option, i) => {
    option.classList.toggle("selected", i === index);
  });
}

/**
 * Loads n number of all questions from the selected course and topic into the questions array, ready 
 * to be deployed one by one to the user.
 */
function setupQuestions(n = 0) {
  if (n === 0) {
    questions = questionsList;
  } else {
    questions = questionsList.slice(0, n);
  }
  currentIndex = 0;
  score = 0;
  results = [];
  answerStats = {};

  questions.forEach(() => results.push(null));
}