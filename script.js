document.addEventListener('DOMContentLoaded', () => {
    const courses = document.querySelectorAll('.course');
    const courseData = {}; // Stores course information: { 'Course Name': { element: div, prereqs: [], completed: false } }
    const STORAGE_KEY = 'mallaCurricularProgress'; // Unique key for localStorage

    // --- Step 1: Initialize Course Data and States ---
    courses.forEach(courseElement => {
        const courseName = courseElement.querySelector('h3').textContent.trim();
        const prereqString = courseElement.dataset.prereq;
        const prereqs = prereqString ? prereqString.split(',').map(p => p.trim()).filter(p => p !== '') : [];

        courseData[courseName] = {
            element: courseElement,
            prereqs: prereqs,
            completed: false // Default to not completed, will be overwritten by loaded data
        };
    });

    // --- Function to Save Progress to Local Storage ---
    function saveProgress() {
        const progressToSave = {};
        for (const name in courseData) {
            progressToSave[name] = courseData[name].completed; // Only save the completion status
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progressToSave));
        console.log('Progress saved!');
    }

    // --- Function to Load Progress from Local Storage ---
    function loadProgress() {
        const savedProgress = localStorage.getItem(STORAGE_KEY);
        if (savedProgress) {
            const parsedProgress = JSON.parse(savedProgress);
            for (const name in parsedProgress) {
                if (courseData[name]) { // Check if the course exists in our current data
                    courseData[name].completed = parsedProgress[name];
                }
            }
            console.log('Progress loaded!');
        }
    }

    // --- Function to Update Course Visual States (Enabled/Disabled, Completed/Not) ---
    function updateCourseStates() {
        for (const name in courseData) {
            const course = courseData[name];

            if (course.completed) {
                // If a course is completed, it should be marked as such and not disabled
                course.element.classList.add('completed');
                course.element.classList.remove('disabled');
                course.element.style.cursor = 'pointer'; // Make it clickable to unmark
            } else {
                // Check if prerequisites are met for non-completed courses
                const allPrereqsMet = course.prereqs.every(prereqName => {
                    // A prerequisite is met if it's in courseData AND it's marked as completed
                    return courseData[prereqName] && courseData[prereqName].completed;
                });

                if (allPrereqsMet) {
                    // Enable the course if all its prerequisites are met
                    course.element.classList.remove('disabled');
                    course.element.classList.remove('completed'); // Ensure it's not marked completed if not yet clicked
                    course.element.style.cursor = 'pointer'; // Make it clickable
                } else {
                    // Keep the course disabled if prerequisites are not met
                    course.element.classList.add('disabled');
                    course.element.classList.remove('completed');
                    course.element.style.cursor = 'not-allowed'; // Show disabled cursor
                }
            }
        }
    }

    // --- Step 3: Add Click Event Listeners ---
    courses.forEach(courseElement => {
        courseElement.addEventListener('click', () => {
            const courseName = courseElement.querySelector('h3').textContent.trim();
            const course = courseData[courseName];

            // Only allow interaction if the course is not disabled
            // OR if it's currently active (showing prereqs), allow to close it even if disabled
            if (!course.element.classList.contains('disabled') || course.element.classList.contains('active')) {
                // Toggle completion status
                if (!course.element.classList.contains('disabled')) { // Only toggle completion if not disabled
                     course.completed = !course.completed;
                }

                // Toggle visibility of its own prerequisite info
                course.element.classList.toggle('active');

                // Close other course info panels if open
                courses.forEach(otherCourseElement => {
                    if (otherCourseElement !== courseElement && otherCourseElement.classList.contains('active')) {
                        otherCourseElement.classList.remove('active');
                    }
                });

                // After a change, update the state of all courses and save progress
                updateCourseStates();
                saveProgress();
            }
        });
    });

    // --- Initial Calls: Load and Set up the page correctly on load ---
    loadProgress(); // Load saved data first
    updateCourseStates(); // Then update the visual state based on loaded data
});