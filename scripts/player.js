// JavaScript עבור נגן החידון
document.addEventListener('DOMContentLoaded', function() {
    initializePlayer();
    loadQuizQuestions();
    setupKeyboardControls();
});

let currentQuestionIndex = 0;
let questions = [];
let timer = null;
let timeLeft = 30;
let isTimerRunning = false;
let isAnswerRevealed = false;
let teams = {
    'קבוצה 1': 0,
    'קבוצה 2': 0,
    'קבוצה 3': 0
};

function initializePlayer() {
    // הצגת מסך הפתיחה
    showOpeningScreen();
}

function showOpeningScreen() {
    const openingScreen = document.getElementById('openingScreen');
    const quizScreen = document.getElementById('quizScreen');
    const openingVideo = document.getElementById('openingVideo');
    const countdown = document.getElementById('countdown');
    
    openingScreen.style.display = 'block';
    quizScreen.style.display = 'none';
    
    // התחלת ספירה לאחור
    let countdownValue = 3;
    countdown.textContent = countdownValue;
    
    const countdownInterval = setInterval(() => {
        countdownValue--;
        if (countdownValue > 0) {
            countdown.textContent = countdownValue;
        } else {
            countdown.textContent = '!התחלנו';
            clearInterval(countdownInterval);
            
            setTimeout(() => {
                startQuiz();
            }, 1000);
        }
    }, 1000);
    
    // מאזין לסיום הוידאו
    if (openingVideo) {
        openingVideo.addEventListener('ended', () => {
            setTimeout(() => {
                startQuiz();
            }, 500);
        });
    }
}

function startQuiz() {
    const openingScreen = document.getElementById('openingScreen');
    const quizScreen = document.getElementById('quizScreen');
    
    openingScreen.style.display = 'none';
    quizScreen.style.display = 'block';
    
    if (questions.length > 0) {
        displayQuestion();
    } else {
        alert('לא נמצאו שאלות. חזרה לדף הבית.');
        goHome();
    }
}

function loadQuizQuestions() {
    const savedQuestions = localStorage.getItem('quizQuestions');
    if (savedQuestions) {
        questions = JSON.parse(savedQuestions);
        updateTotalQuestions();
    }
}

function updateTotalQuestions() {
    const totalQuestionsElement = document.getElementById('totalQuestions');
    if (totalQuestionsElement) {
        totalQuestionsElement.textContent = questions.length;
    }
}

function displayQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endQuiz();
        return;
    }
    
    const currentQuestion = questions[currentQuestionIndex];
    isAnswerRevealed = false;
    
    // עדכון מספר השאלה
    updateQuestionNumber();
    
    // עדכון תוכן השאלה
    updateQuestionContent(currentQuestion);
    
    // עדכון מדיה
    updateQuestionMedia(currentQuestion);
    
    // עדכון תשובות
    updateAnswerOptions(currentQuestion);
    
    // התחלת טיימר
    startQuestionTimer(currentQuestion.timer);
    
    // הסתרת הימור כפול
    document.getElementById('doubleBet').style.display = 'none';
}

function updateQuestionNumber() {
    const questionNumElement = document.getElementById('currentQuestionNum');
    if (questionNumElement) {
        questionNumElement.textContent = currentQuestionIndex + 1;
    }
}

function updateQuestionContent(question) {
    const questionTextElement = document.getElementById('questionText');
    if (questionTextElement) {
        questionTextElement.textContent = question.text;
    }
}

function updateQuestionMedia(question) {
    const mediaContainer = document.getElementById('mediaContainer');
    const imageElement = document.getElementById('questionImage');
    const videoElement = document.getElementById('questionVideo');
    const audioElement = document.getElementById('questionAudio');
    
    // הסתרת כל המדיה
    mediaContainer.style.display = 'none';
    imageElement.style.display = 'none';
    videoElement.style.display = 'none';
    audioElement.style.display = 'none';
    
    if (question.mediaUrl) {
        mediaContainer.style.display = 'block';
        
        switch(question.type) {
            case 'image':
                imageElement.src = question.mediaUrl;
                imageElement.style.display = 'block';
                break;
            case 'video':
                videoElement.src = question.mediaUrl;
                videoElement.style.display = 'block';
                break;
            case 'audio':
                audioElement.src = question.mediaUrl;
                audioElement.style.display = 'block';
                break;
        }
    }
}

function updateAnswerOptions(question) {
    const answersContainer = document.getElementById('answersContainer');
    answersContainer.innerHTML = '';
    
    question.answers.forEach((answer, index) => {
        const answerElement = document.createElement('div');
        answerElement.className = 'answer-option';
        answerElement.innerHTML = `
            <span class="answer-number">${index + 1}</span>
            ${answer}
        `;
        answersContainer.appendChild(answerElement);
    });
}

function startQuestionTimer(duration) {
    timeLeft = duration;
    isTimerRunning = true;
    updateTimerDisplay();
    
    timer = setInterval(() => {
        timeLeft--;
        updateTimerDisplay();
        
        if (timeLeft <= 0) {
            stopTimer();
            revealAnswer();
        }
    }, 1000);
}

function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    isTimerRunning = false;
}

function toggleTimer() {
    if (isTimerRunning) {
        stopTimer();
    } else if (timeLeft > 0 && !isAnswerRevealed) {
        startQuestionTimer(timeLeft);
    }
}

function updateTimerDisplay() {
    const timerTextElement = document.getElementById('timerText');
    const timerCircle = document.getElementById('timerCircle');
    
    if (timerTextElement) {
        timerTextElement.textContent = timeLeft;
    }
    
    if (timerCircle) {
        const currentQuestion = questions[currentQuestionIndex];
        const totalTime = currentQuestion ? currentQuestion.timer : 30;
        const percentage = (timeLeft / totalTime) * 100;
        const degrees = (percentage / 100) * 360;
        
        const color = getTimerColor(percentage);
        timerCircle.style.background = `conic-gradient(
            ${color} 0deg,
            ${color} ${degrees}deg,
            var(--neutral-300) ${degrees}deg
        )`;
        
        // הוספת מחלקות CSS
        timerCircle.className = `timer-circle ${getTimerClass(percentage)}`;
    }
}

function getTimerColor(percentage) {
    if (percentage > 50) return 'var(--success-green)';
    if (percentage > 25) return 'var(--accent-yellow)';
    return 'var(--error-red)';
}

function getTimerClass(percentage) {
    if (percentage > 50) return '';
    if (percentage > 25) return 'warning';
    return 'danger';
}

function revealAnswer() {
    if (isAnswerRevealed) return;
    
    isAnswerRevealed = true;
    stopTimer();
    
    const currentQuestion = questions[currentQuestionIndex];
    const answerElements = document.querySelectorAll('.answer-option');
    
    answerElements.forEach((element, index) => {
        if (currentQuestion.correctAnswers.includes(index)) {
            element.classList.add('correct');
        } else if (currentQuestion.type !== 'poll') {
            element.classList.add('incorrect');
        }
    });
    
    // אפקט קולי
    playCorrectSound();
    
    // הצגת אינדיקטור לתשובה
    showResponseIndicator('התשובה הנכונה נחשפה!');
}

function playCorrectSound() {
    // ניתן להוסיף אפקט קולי כאן
    console.log('Playing correct answer sound');
}

function showResponseIndicator(message) {
    const indicator = document.getElementById('responseIndicator');
    if (indicator) {
        indicator.textContent = message;
        indicator.style.display = 'block';
        
        setTimeout(() => {
            indicator.style.display = 'none';
        }, 3000);
    }
}

function nextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        displayQuestion();
    } else {
        endQuiz();
    }
}

function previousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        displayQuestion();
    }
}

function endQuiz() {
    stopTimer();
    showEndScreen();
}

function showEndScreen() {
    const endScreen = document.getElementById('endScreen');
    const quizScreen = document.getElementById('quizScreen');
    
    quizScreen.style.display = 'none';
    endScreen.style.display = 'block';
    
    // הצגת מנצח
    const winner = getWinner();
    const winnerElement = document.getElementById('winnerName');
    if (winnerElement && winner) {
        winnerElement.textContent = winner;
    }
    
    // עדכון טבלת מובילים סופית
    updateFinalLeaderboard();
}

function getWinner() {
    const teamEntries = Object.entries(teams);
    if (teamEntries.length === 0) return 'אין מנצח';
    
    const [winner] = teamEntries.reduce((a, b) => a[1] > b[1] ? a : b);
    return winner;
}

function updateFinalLeaderboard() {
    const finalLeaderboard = document.getElementById('finalLeaderboard');
    if (!finalLeaderboard) return;
    
    const sortedTeams = Object.entries(teams)
        .sort(([,a], [,b]) => b - a);
    
    finalLeaderboard.innerHTML = sortedTeams.map(([team, score], index) => `
        <div class="team-score ${index === 0 ? 'winner' : ''}">
            <span class="team-name">${index + 1}. ${team}</span>
            <span class="team-points">${score}</span>
        </div>
    `).join('');
}

function toggleLeaderboard() {
    const leaderboard = document.getElementById('leaderboard');
    if (leaderboard) {
        const isVisible = leaderboard.style.display === 'block';
        leaderboard.style.display = isVisible ? 'none' : 'block';
        
        if (!isVisible) {
            updateLeaderboard();
        }
    }
}

function updateLeaderboard() {
    const leaderboardContent = document.getElementById('leaderboardContent');
    if (!leaderboardContent) return;
    
    const sortedTeams = Object.entries(teams)
        .sort(([,a], [,b]) => b - a);
    
    leaderboardContent.innerHTML = sortedTeams.map(([team, score], index) => `
        <div class="team-score ${index === 0 ? 'leader' : ''}">
            <span class="team-name">${team}</span>
            <span class="team-points">${score}</span>
        </div>
    `).join('');
}

function toggleDoubleBet() {
    const doubleBet = document.getElementById('doubleBet');
    if (doubleBet) {
        const isVisible = doubleBet.style.display === 'block';
        doubleBet.style.display = isVisible ? 'none' : 'block';
    }
}

function toggleMedia() {
    const videoElement = document.getElementById('questionVideo');
    const audioElement = document.getElementById('questionAudio');
    
    if (videoElement && videoElement.style.display === 'block') {
        if (videoElement.paused) {
            videoElement.play();
        } else {
            videoElement.pause();
        }
    }
    
    if (audioElement && audioElement.style.display === 'block') {
        if (audioElement.paused) {
            audioElement.play();
        } else {
            audioElement.pause();
        }
    }
}

function adjustVolume(change) {
    const videoElement = document.getElementById('questionVideo');
    const audioElement = document.getElementById('questionAudio');
    
    if (videoElement && videoElement.style.display === 'block') {
        videoElement.volume = Math.max(0, Math.min(1, videoElement.volume + change));
    }
    
    if (audioElement && audioElement.style.display === 'block') {
        audioElement.volume = Math.max(0, Math.min(1, audioElement.volume + change));
    }
}

function toggleMute() {
    const videoElement = document.getElementById('questionVideo');
    const audioElement = document.getElementById('questionAudio');
    
    if (videoElement && videoElement.style.display === 'block') {
        videoElement.muted = !videoElement.muted;
    }
    
    if (audioElement && audioElement.style.display === 'block') {
        audioElement.muted = !audioElement.muted;
    }
}

function setupKeyboardControls() {
    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'F1':
                e.preventDefault();
                toggleLeaderboard();
                break;
            case 'F2':
                e.preventDefault();
                previousQuestion();
                break;
            case 'F3':
                e.preventDefault();
                goHome();
                break;
            case 'F4':
                e.preventDefault();
                if (isAnswerRevealed) {
                    revealAnswer();
                } else {
                    toggleTimer();
                }
                break;
            case 'F5':
                e.preventDefault();
                nextQuestion();
                break;
            case 'F6':
                e.preventDefault();
                toggleMedia();
                break;
            case 'F7':
                e.preventDefault();
                adjustVolume(0.1);
                break;
            case 'F8':
                e.preventDefault();
                toggleMute();
                break;
            case ' ':
                e.preventDefault();
                const openingVideo = document.getElementById('openingVideo');
                if (openingVideo && document.getElementById('openingScreen').style.display !== 'none') {
                    if (openingVideo.paused) {
                        openingVideo.play();
                    } else {
                        openingVideo.pause();
                    }
                }
                break;
            case 'Escape':
                e.preventDefault();
                if (confirm('האם אתה בטוח שברצונך לצאת?')) {
                    goHome();
                }
                break;
            case 'd':
            case 'D':
                if (e.ctrlKey) {
                    e.preventDefault();
                    toggleDoubleBet();
                }
                break;
        }
    });
}

function goHome() {
    window.location.href = 'index.html';
}

// הדמיית מערכת IVR
function simulateIVRResponse(teamName, answer) {
    teams[teamName] = (teams[teamName] || 0) + (answer === 'correct' ? 10 : 0);
    showResponseIndicator(`${teamName} ענה!`);
    updateLeaderboard();
}

// פונקציות נוספות לשליטה במשחק
function resetGame() {
    currentQuestionIndex = 0;
    teams = {
        'קבוצה 1': 0,
        'קבוצה 2': 0,
        'קבוצה 3': 0
    };
    stopTimer();
    isAnswerRevealed = false;
}

function jumpToQuestion(questionIndex) {
    if (questionIndex >= 0 && questionIndex < questions.length) {
        currentQuestionIndex = questionIndex;
        displayQuestion();
    }
}

// אירועים לטעינת הדף
window.addEventListener('load', function() {
    // וידוא שהדף נטען במלואו
    console.log('Player loaded successfully');
});

window.addEventListener('beforeunload', function() {
    // ניקוי משאבים
    stopTimer();
});