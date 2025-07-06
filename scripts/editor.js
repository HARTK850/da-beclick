// JavaScript עבור עורך החידונים
document.addEventListener('DOMContentLoaded', function() {
    initializeEditor();
    loadSavedQuestions();
    setupEventListeners();
});

let currentEditingQuestion = null;
let questions = [];

function initializeEditor() {
    // טעינת שאלות מ-localStorage
    const savedQuestions = localStorage.getItem('quizQuestions');
    if (savedQuestions) {
        questions = JSON.parse(savedQuestions);
        updateQuestionsList();
    }

    // הגדרת מאזינים לשינוי סוג שאלה
    const questionTypeInputs = document.querySelectorAll('input[name="questionType"]');
    questionTypeInputs.forEach(input => {
        input.addEventListener('change', handleQuestionTypeChange);
    });
}

function setupEventListeners() {
    // טעינת קובץ חידון
    document.getElementById('loadQuizFile').addEventListener('change', handleFileLoad);
    
    // מאזינים לכפתורי פעולה
    document.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveQuiz();
        }
    });
}

function handleQuestionTypeChange(e) {
    const selectedType = e.target.value;
    const mediaUpload = document.getElementById('mediaUpload');
    const answersSection = document.querySelector('.answers-section');
    
    // הצגת/הסתרת אזור העלאת מדיה
    if (['image', 'video', 'audio'].includes(selectedType)) {
        mediaUpload.style.display = 'block';
        updateMediaUploadType(selectedType);
    } else {
        mediaUpload.style.display = 'none';
    }

    // הצגת/הסתרת תיבות "תשובה נכונה" עבור סקר
    const correctAnswerCheckboxes = document.querySelectorAll('.correct-answer');
    correctAnswerCheckboxes.forEach(checkbox => {
        checkbox.style.display = selectedType === 'poll' ? 'none' : 'inline-block';
    });

    // עדכון תווית בהתאם
    const labels = document.querySelectorAll('.correct-answer + label');
    labels.forEach(label => {
        label.style.display = selectedType === 'poll' ? 'none' : 'inline-block';
    });
}

function updateMediaUploadType(type) {
    const mediaFile = document.getElementById('mediaFile');
    const mediaUrl = document.getElementById('mediaUrl');
    
    switch(type) {
        case 'image':
            mediaFile.accept = 'image/*';
            mediaUrl.placeholder = 'או הזן כתובת URL של התמונה';
            break;
        case 'video':
            mediaFile.accept = 'video/*';
            mediaUrl.placeholder = 'או הזן כתובת URL של הוידאו (יוטיוב/וימיו)';
            break;
        case 'audio':
            mediaFile.accept = 'audio/*';
            mediaUrl.placeholder = 'או הזן כתובת URL של קובץ השמע';
            break;
    }
}

function addAnswer() {
    const answersContainer = document.getElementById('answersContainer');
    const answerCount = answersContainer.children.length;
    
    const answerItem = document.createElement('div');
    answerItem.className = 'answer-item';
    answerItem.innerHTML = `
        <input type="text" class="answer-input" placeholder="תשובה ${answerCount + 1}">
        <input type="checkbox" class="correct-answer">
        <label>נכונה</label>
        <button type="button" class="remove-answer" onclick="removeAnswer(this)">✕</button>
    `;
    
    answersContainer.appendChild(answerItem);
    
    // בדיקה אם זה סקר ולהסתיר תיבות סימון
    const selectedType = document.querySelector('input[name="questionType"]:checked').value;
    if (selectedType === 'poll') {
        const checkbox = answerItem.querySelector('.correct-answer');
        const label = answerItem.querySelector('label');
        checkbox.style.display = 'none';
        label.style.display = 'none';
    }
}

function removeAnswer(button) {
    const answersContainer = document.getElementById('answersContainer');
    if (answersContainer.children.length > 2) {
        button.parentElement.remove();
    } else {
        alert('חייב להיות לפחות 2 אפשרויות תשובה');
    }
}

function adjustTimer(change) {
    const timerInput = document.getElementById('timer');
    const currentValue = parseInt(timerInput.value);
    const newValue = Math.max(5, Math.min(300, currentValue + change));
    timerInput.value = newValue;
}

function uploadMedia() {
    const mediaFile = document.getElementById('mediaFile');
    const mediaUrl = document.getElementById('mediaUrl');
    
    if (mediaFile.files.length > 0) {
        // טיפול בקובץ מקומי
        const file = mediaFile.files[0];
        const reader = new FileReader();
        reader.onload = function(e) {
            // כאן ניתן לשמור את הקובץ או להעלות אותו
            console.log('File loaded:', e.target.result);
            alert('הקובץ הועלה בהצלחה');
        };
        reader.readAsDataURL(file);
    } else if (mediaUrl.value) {
        // טיפול ב-URL
        if (isValidUrl(mediaUrl.value)) {
            alert('הכתובת נשמרה בהצלחה');
        } else {
            alert('כתובת URL לא תקינה');
        }
    } else {
        alert('אנא בחר קובץ או הזן כתובת URL');
    }
}

function isValidUrl(string) {
    try {
        new URL(string);
        return true;
    } catch (_) {
        return false;
    }
}

function addQuestion() {
    const questionType = document.querySelector('input[name="questionType"]:checked').value;
    const questionText = document.getElementById('questionText').value.trim();
    const timer = parseInt(document.getElementById('timer').value);
    const mediaUrl = document.getElementById('mediaUrl').value.trim();
    
    if (!questionText) {
        alert('אנא הזן תוכן שאלה');
        return;
    }

    // איסוף תשובות
    const answerInputs = document.querySelectorAll('.answer-input');
    const correctAnswers = document.querySelectorAll('.correct-answer');
    const answers = [];
    const correctAnswerIndices = [];
    
    answerInputs.forEach((input, index) => {
        const answerText = input.value.trim();
        if (answerText) {
            answers.push(answerText);
            if (correctAnswers[index] && correctAnswers[index].checked) {
                correctAnswerIndices.push(answers.length - 1);
            }
        }
    });

    if (answers.length < 2) {
        alert('חייב להיות לפחות 2 אפשרויות תשובה');
        return;
    }

    if (questionType !== 'poll' && correctAnswerIndices.length === 0) {
        alert('אנא סמן לפחות תשובה נכונה אחת');
        return;
    }

    const question = {
        id: currentEditingQuestion ? currentEditingQuestion.id : Date.now(),
        type: questionType,
        text: questionText,
        answers: answers,
        correctAnswers: correctAnswerIndices,
        timer: timer,
        mediaUrl: mediaUrl || null
    };

    if (currentEditingQuestion) {
        // עדכון שאלה קיימת
        const index = questions.findIndex(q => q.id === currentEditingQuestion.id);
        if (index !== -1) {
            questions[index] = question;
        }
        currentEditingQuestion = null;
    } else {
        // הוספת שאלה חדשה
        questions.push(question);
    }

    saveQuestions();
    updateQuestionsList();
    clearQuestionForm();
    
    alert('השאלה נוספה בהצלחה!');
}

function clearQuestionForm() {
    document.getElementById('questionText').value = '';
    document.getElementById('timer').value = '30';
    document.getElementById('mediaUrl').value = '';
    document.getElementById('mediaFile').value = '';
    
    // איפוס תשובות
    const answersContainer = document.getElementById('answersContainer');
    answersContainer.innerHTML = `
        <div class="answer-item">
            <input type="text" class="answer-input" placeholder="תשובה 1">
            <input type="checkbox" class="correct-answer">
            <label>נכונה</label>
            <button type="button" class="remove-answer" onclick="removeAnswer(this)">✕</button>
        </div>
        <div class="answer-item">
            <input type="text" class="answer-input" placeholder="תשובה 2">
            <input type="checkbox" class="correct-answer">
            <label>נכונה</label>
            <button type="button" class="remove-answer" onclick="removeAnswer(this)">✕</button>
        </div>
    `;
    
    // איפוס בחירת סוג שאלה
    document.querySelector('input[name="questionType"][value="normal"]').checked = true;
    document.getElementById('mediaUpload').style.display = 'none';
}

function updateQuestionsList() {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';
    
    questions.forEach((question, index) => {
        const questionCard = document.createElement('div');
        questionCard.className = 'question-card';
        questionCard.innerHTML = `
            <div class="question-card-header">
                <span class="question-number">שאלה ${index + 1}</span>
                <span class="question-type">${getQuestionTypeLabel(question.type)}</span>
            </div>
            <div class="question-preview">${question.text}</div>
            <div class="question-timer">טיימר: ${question.timer} שניות</div>
            <div class="question-actions">
                <button class="edit-btn" onclick="editQuestion(${question.id})">ערוך</button>
                <button class="copy-btn" onclick="copyQuestion(${question.id})">שכפל</button>
                <button class="delete-btn" onclick="deleteQuestion(${question.id})">מחק</button>
            </div>
        `;
        
        questionsList.appendChild(questionCard);
    });
}

function getQuestionTypeLabel(type) {
    const labels = {
        'normal': 'רגילה',
        'image': 'עם תמונה',
        'video': 'עם וידאו',
        'audio': 'עם שמע',
        'poll': 'סקר'
    };
    return labels[type] || 'לא ידוע';
}

function editQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    currentEditingQuestion = question;
    
    // מילוי הטופס
    document.querySelector(`input[name="questionType"][value="${question.type}"]`).checked = true;
    handleQuestionTypeChange({ target: { value: question.type } });
    
    document.getElementById('questionText').value = question.text;
    document.getElementById('timer').value = question.timer;
    
    if (question.mediaUrl) {
        document.getElementById('mediaUrl').value = question.mediaUrl;
    }
    
    // מילוי תשובות
    const answersContainer = document.getElementById('answersContainer');
    answersContainer.innerHTML = '';
    
    question.answers.forEach((answer, index) => {
        const answerItem = document.createElement('div');
        answerItem.className = 'answer-item';
        answerItem.innerHTML = `
            <input type="text" class="answer-input" value="${answer}" placeholder="תשובה ${index + 1}">
            <input type="checkbox" class="correct-answer" ${question.correctAnswers.includes(index) ? 'checked' : ''}>
            <label>נכונה</label>
            <button type="button" class="remove-answer" onclick="removeAnswer(this)">✕</button>
        `;
        
        answersContainer.appendChild(answerItem);
    });
    
    // גלילה לאזור העריכה
    document.querySelector('.question-editor').scrollIntoView({ behavior: 'smooth' });
}

function copyQuestion(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (!question) return;
    
    const newQuestion = {
        ...question,
        id: Date.now(),
        text: question.text + ' (עותק)'
    };
    
    questions.push(newQuestion);
    saveQuestions();
    updateQuestionsList();
    
    alert('השאלה שוכפלה בהצלחה!');
}

function deleteQuestion(questionId) {
    if (confirm('האם אתה בטוח שברצונך למחוק שאלה זו?')) {
        questions = questions.filter(q => q.id !== questionId);
        saveQuestions();
        updateQuestionsList();
        alert('השאלה נמחקה בהצלחה');
    }
}

function saveQuestions() {
    localStorage.setItem('quizQuestions', JSON.stringify(questions));
}

function loadSavedQuestions() {
    const savedQuestions = localStorage.getItem('quizQuestions');
    if (savedQuestions) {
        questions = JSON.parse(savedQuestions);
        updateQuestionsList();
    }
}

function saveQuiz() {
    if (questions.length === 0) {
        alert('אין שאלות לשמירה');
        return;
    }
    
    const quizData = {
        title: 'חידון דע בקליק',
        created: new Date().toISOString(),
        questions: questions
    };
    
    const dataStr = JSON.stringify(quizData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `quiz-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    alert('החידון נשמר בהצלחה!');
}

function loadQuiz() {
    document.getElementById('loadQuizFile').click();
}

function handleFileLoad(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const quizData = JSON.parse(e.target.result);
            if (quizData.questions && Array.isArray(quizData.questions)) {
                questions = quizData.questions;
                saveQuestions();
                updateQuestionsList();
                alert('החידון נטען בהצלחה!');
            } else {
                alert('קובץ לא תקין');
            }
        } catch (error) {
            alert('שגיאה בטעינת הקובץ');
        }
    };
    reader.readAsText(file);
}

function clearQuiz() {
    if (confirm('האם אתה בטוח שברצונך למחוק את כל השאלות?')) {
        questions = [];
        saveQuestions();
        updateQuestionsList();
        clearQuestionForm();
        alert('כל השאלות נמחקו');
    }
}

function startQuiz() {
    if (questions.length === 0) {
        alert('אין שאלות להפעלה');
        return;
    }
    
    // שמירה ומעבר לנגן
    saveQuestions();
    window.location.href = 'player.html';
}

// פונקציות AI
function generateAIQuestions() {
    const topic = document.getElementById('aiTopic').value.trim();
    const count = parseInt(document.getElementById('aiCount').value);
    
    if (!topic) {
        alert('אנא הזן נושא');
        return;
    }
    
    // הדמיה של קריאה ל-AI
    const aiResults = document.getElementById('aiResults');
    aiResults.innerHTML = '<div style="text-align: center; padding: 20px;">מייצר שאלות...</div>';
    
    // הדמיה של שאלות מה-AI (בפועל יהיה כאן קריאה לשרת)
    setTimeout(() => {
        const mockQuestions = generateMockQuestions(topic, count);
        displayAIResults(mockQuestions);
    }, 2000);
}

function generateMockQuestions(topic, count) {
    const templates = [
        {
            text: `מה הוא ${topic}?`,
            answers: ['תשובה 1', 'תשובה 2', 'תשובה 3', 'תשובה 4'],
            correctAnswers: [0]
        },
        {
            text: `מתי נוצר ${topic}?`,
            answers: ['1950', '1960', '1970', '1980'],
            correctAnswers: [1]
        },
        {
            text: `איפה נמצא ${topic}?`,
            answers: ['ישראל', 'אמריקה', 'אירופה', 'אסיה'],
            correctAnswers: [0]
        }
    ];
    
    return Array.from({ length: Math.min(count, 10) }, (_, i) => {
        const template = templates[i % templates.length];
        return {
            id: Date.now() + i,
            type: 'normal',
            text: template.text,
            answers: template.answers,
            correctAnswers: template.correctAnswers,
            timer: 30,
            mediaUrl: null
        };
    });
}

function displayAIResults(aiQuestions) {
    const aiResults = document.getElementById('aiResults');
    aiResults.innerHTML = '';
    
    aiQuestions.forEach(question => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'ai-question-result';
        questionDiv.innerHTML = `
            <div style="background: #f0f0f0; padding: 15px; margin: 10px 0; border-radius: 8px;">
                <h4>${question.text}</h4>
                <ul>
                    ${question.answers.map((answer, index) => `
                        <li style="color: ${question.correctAnswers.includes(index) ? 'green' : 'black'}">
                            ${answer} ${question.correctAnswers.includes(index) ? '✓' : ''}
                        </li>
                    `).join('')}
                </ul>
                <button onclick="addAIQuestion(${question.id})" style="background: #8B5CF6; color: white; padding: 5px 10px; border: none; border-radius: 4px;">
                    הוסף שאלה זו
                </button>
            </div>
        `;
        aiResults.appendChild(questionDiv);
    });
    
    // שמירת השאלות זמנית
    window.tempAIQuestions = aiQuestions;
}

function addAIQuestion(questionId) {
    const aiQuestion = window.tempAIQuestions?.find(q => q.id === questionId);
    if (aiQuestion) {
        questions.push(aiQuestion);
        saveQuestions();
        updateQuestionsList();
        alert('השאלה נוספה בהצלחה!');
    }
}

function goHome() {
    if (questions.length > 0) {
        if (confirm('יש לך שאלות שלא נשמרו. האם אתה בטוח שברצונך לעזוב?')) {
            window.location.href = 'index.html';
        }
    } else {
        window.location.href = 'index.html';
    }
}