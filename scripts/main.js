// קובץ JavaScript ראשי
class QuizApp {
    constructor() {
        this.currentQuiz = null;
        this.questions = [];
        this.currentQuestionIndex = 0;
        this.scores = {};
        this.timer = null;
        this.timeLeft = 30;
        this.isTimerRunning = false;
        this.isAnswerRevealed = false;
        this.doubleBetMode = false;
        
        this.initializeApp();
    }

    initializeApp() {
        this.loadFromStorage();
        this.setupKeyboardShortcuts();
        this.setupEventListeners();
    }

    // שמירה וטעינה מ-localStorage
    saveToStorage() {
        const data = {
            questions: this.questions,
            scores: this.scores,
            currentQuestionIndex: this.currentQuestionIndex
        };
        localStorage.setItem('quizData', JSON.stringify(data));
    }

    loadFromStorage() {
        const data = localStorage.getItem('quizData');
        if (data) {
            const parsed = JSON.parse(data);
            this.questions = parsed.questions || [];
            this.scores = parsed.scores || {};
            this.currentQuestionIndex = parsed.currentQuestionIndex || 0;
        }
    }

    clearStorage() {
        localStorage.removeItem('quizData');
        this.questions = [];
        this.scores = {};
        this.currentQuestionIndex = 0;
    }

    // ניהול שאלות
    addQuestion(questionData) {
        const question = {
            id: Date.now() + Math.random(),
            type: questionData.type || 'normal',
            text: questionData.text,
            answers: questionData.answers || [],
            correctAnswers: questionData.correctAnswers || [],
            timer: questionData.timer || 30,
            media: questionData.media || null,
            mediaUrl: questionData.mediaUrl || null
        };
        
        this.questions.push(question);
        this.saveToStorage();
        return question;
    }

    removeQuestion(questionId) {
        this.questions = this.questions.filter(q => q.id !== questionId);
        this.saveToStorage();
    }

    updateQuestion(questionId, questionData) {
        const index = this.questions.findIndex(q => q.id === questionId);
        if (index !== -1) {
            this.questions[index] = { ...this.questions[index], ...questionData };
            this.saveToStorage();
        }
    }

    // ניהול טיימר
    startTimer(duration = 30) {
        this.timeLeft = duration;
        this.isTimerRunning = true;
        this.updateTimerDisplay();
        
        this.timer = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.timeLeft <= 0) {
                this.stopTimer();
                this.revealAnswer();
            }
        }, 1000);
    }

    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.isTimerRunning = false;
    }

    toggleTimer() {
        if (this.isTimerRunning) {
            this.stopTimer();
        } else {
            this.startTimer(this.timeLeft);
        }
    }

    updateTimerDisplay() {
        const timerElement = document.getElementById('timerText');
        const timerCircle = document.getElementById('timerCircle');
        
        if (timerElement) {
            timerElement.textContent = this.timeLeft;
        }
        
        if (timerCircle) {
            const currentQuestion = this.questions[this.currentQuestionIndex];
            const totalTime = currentQuestion ? currentQuestion.timer : 30;
            const percentage = (this.timeLeft / totalTime) * 100;
            const degrees = (percentage / 100) * 360;
            
            timerCircle.style.background = `conic-gradient(
                ${this.getTimerColor()} 0deg,
                ${this.getTimerColor()} ${degrees}deg,
                var(--neutral-300) ${degrees}deg
            )`;
            
            timerCircle.className = `timer-circle ${this.getTimerClass()}`;
        }
    }

    getTimerColor() {
        const percentage = (this.timeLeft / (this.questions[this.currentQuestionIndex]?.timer || 30)) * 100;
        if (percentage > 50) return 'var(--success-green)';
        if (percentage > 25) return 'var(--accent-yellow)';
        return 'var(--error-red)';
    }

    getTimerClass() {
        const percentage = (this.timeLeft / (this.questions[this.currentQuestionIndex]?.timer || 30)) * 100;
        if (percentage > 50) return '';
        if (percentage > 25) return 'warning';
        return 'danger';
    }

    // חשיפת תשובה
    revealAnswer() {
        this.isAnswerRevealed = true;
        this.stopTimer();
        
        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (!currentQuestion) return;

        const answerElements = document.querySelectorAll('.answer-option');
        answerElements.forEach((element, index) => {
            if (currentQuestion.correctAnswers.includes(index)) {
                element.classList.add('correct');
            } else if (currentQuestion.type !== 'poll') {
                element.classList.add('incorrect');
            }
        });

        // אפקט קולי (אם נתמך)
        this.playSound('correct');
    }

    // ניהול קיצורי מקלדת
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return; // לא לטפל בקיצורים כאשר הפוקוס בשדה קלט
            }

            switch(e.key) {
                case 'F1':
                    e.preventDefault();
                    this.toggleLeaderboard();
                    break;
                case 'F2':
                    e.preventDefault();
                    this.previousQuestion();
                    break;
                case 'F3':
                    e.preventDefault();
                    this.goToLoadScreen();
                    break;
                case 'F4':
                    e.preventDefault();
                    this.toggleTimer();
                    break;
                case 'F5':
                    e.preventDefault();
                    this.nextQuestion();
                    break;
                case 'F6':
                    e.preventDefault();
                    this.toggleMedia();
                    break;
                case 'F7':
                    e.preventDefault();
                    this.adjustVolume(0.1);
                    break;
                case 'F8':
                    e.preventDefault();
                    this.toggleMute();
                    break;
                case ' ':
                    if (document.getElementById('openingScreen')?.style.display !== 'none') {
                        e.preventDefault();
                        this.toggleOpeningVideo();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.exitFullscreen();
                    break;
            }
        });
    }

    setupEventListeners() {
        // מאזינים לאירועים כלליים
        window.addEventListener('beforeunload', () => {
            this.saveToStorage();
        });
    }

    // פונקציות ניווט
    goHome() {
        window.location.href = 'index.html';
    }

    goToEditor() {
        window.location.href = 'editor.html';
    }

    goToPlayer() {
        window.location.href = 'player.html';
    }

    goToLoadScreen() {
        // חזרה למסך טעינת חידון
        if (confirm('האם אתה בטוח שברצונך לחזור למסך טעינת החידון?')) {
            this.goToPlayer();
        }
    }

    // ניהול שאלות במהלך המשחק
    nextQuestion() {
        if (this.currentQuestionIndex < this.questions.length - 1) {
            this.currentQuestionIndex++;
            this.displayQuestion();
        } else {
            this.endQuiz();
        }
    }

    previousQuestion() {
        if (this.currentQuestionIndex > 0) {
            this.currentQuestionIndex--;
            this.displayQuestion();
        }
    }

    displayQuestion() {
        const currentQuestion = this.questions[this.currentQuestionIndex];
        if (!currentQuestion) return;

        this.isAnswerRevealed = false;
        this.stopTimer();

        // עדכון תצוגת השאלה
        this.updateQuestionDisplay(currentQuestion);
        
        // התחלת טיימר
        this.startTimer(currentQuestion.timer);
    }

    updateQuestionDisplay(question) {
        // עדכון מספר השאלה
        const questionNumElement = document.getElementById('currentQuestionNum');
        if (questionNumElement) {
            questionNumElement.textContent = this.currentQuestionIndex + 1;
        }

        const totalQuestionsElement = document.getElementById('totalQuestions');
        if (totalQuestionsElement) {
            totalQuestionsElement.textContent = this.questions.length;
        }

        // עדכון טקסט השאלה
        const questionTextElement = document.getElementById('questionText');
        if (questionTextElement) {
            questionTextElement.textContent = question.text;
        }

        // עדכון מדיה
        this.updateMediaDisplay(question);

        // עדכון אפשרויות התשובה
        this.updateAnswersDisplay(question);
    }

    updateMediaDisplay(question) {
        const mediaContainer = document.getElementById('mediaContainer');
        const imageElement = document.getElementById('questionImage');
        const videoElement = document.getElementById('questionVideo');
        const audioElement = document.getElementById('questionAudio');

        // הסתרת כל המדיה
        if (mediaContainer) mediaContainer.style.display = 'none';
        if (imageElement) imageElement.style.display = 'none';
        if (videoElement) videoElement.style.display = 'none';
        if (audioElement) audioElement.style.display = 'none';

        if (question.mediaUrl) {
            if (mediaContainer) mediaContainer.style.display = 'block';
            
            switch(question.type) {
                case 'image':
                    if (imageElement) {
                        imageElement.src = question.mediaUrl;
                        imageElement.style.display = 'block';
                    }
                    break;
                case 'video':
                    if (videoElement) {
                        videoElement.src = question.mediaUrl;
                        videoElement.style.display = 'block';
                    }
                    break;
                case 'audio':
                    if (audioElement) {
                        audioElement.src = question.mediaUrl;
                        audioElement.style.display = 'block';
                    }
                    break;
            }
        }
    }

    updateAnswersDisplay(question) {
        const answersContainer = document.getElementById('answersContainer');
        if (!answersContainer) return;

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

    // ניהול טבלת מובילים
    toggleLeaderboard() {
        const leaderboard = document.getElementById('leaderboard');
        if (leaderboard) {
            const isVisible = leaderboard.style.display !== 'none';
            leaderboard.style.display = isVisible ? 'none' : 'block';
        }
    }

    updateLeaderboard() {
        const leaderboardContent = document.getElementById('leaderboardContent');
        if (!leaderboardContent) return;

        const sortedScores = Object.entries(this.scores)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);

        leaderboardContent.innerHTML = sortedScores.map(([team, score]) => `
            <div class="team-score">
                <span class="team-name">${team}</span>
                <span class="team-points">${score}</span>
            </div>
        `).join('');
    }

    // ניהול מדיה
    toggleMedia() {
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

    adjustVolume(change) {
        const videoElement = document.getElementById('questionVideo');
        const audioElement = document.getElementById('questionAudio');
        
        if (videoElement && videoElement.style.display === 'block') {
            videoElement.volume = Math.max(0, Math.min(1, videoElement.volume + change));
        }
        
        if (audioElement && audioElement.style.display === 'block') {
            audioElement.volume = Math.max(0, Math.min(1, audioElement.volume + change));
        }
    }

    toggleMute() {
        const videoElement = document.getElementById('questionVideo');
        const audioElement = document.getElementById('questionAudio');
        
        if (videoElement && videoElement.style.display === 'block') {
            videoElement.muted = !videoElement.muted;
        }
        
        if (audioElement && audioElement.style.display === 'block') {
            audioElement.muted = !audioElement.muted;
        }
    }

    toggleOpeningVideo() {
        const videoElement = document.getElementById('openingVideo');
        if (videoElement) {
            if (videoElement.paused) {
                videoElement.play();
            } else {
                videoElement.pause();
            }
        }
    }

    exitFullscreen() {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            this.goHome();
        }
    }

    // סיום חידון
    endQuiz() {
        this.stopTimer();
        this.showEndScreen();
    }

    showEndScreen() {
        const endScreen = document.getElementById('endScreen');
        if (endScreen) {
            endScreen.style.display = 'block';
            
            const winner = this.getWinner();
            const winnerElement = document.getElementById('winnerName');
            if (winnerElement && winner) {
                winnerElement.textContent = winner;
            }

            this.updateFinalLeaderboard();
        }
    }

    getWinner() {
        const scores = Object.entries(this.scores);
        if (scores.length === 0) return null;
        
        const [winner] = scores.reduce((a, b) => a[1] > b[1] ? a : b);
        return winner;
    }

    updateFinalLeaderboard() {
        const finalLeaderboard = document.getElementById('finalLeaderboard');
        if (!finalLeaderboard) return;

        const sortedScores = Object.entries(this.scores)
            .sort(([,a], [,b]) => b - a);

        finalLeaderboard.innerHTML = sortedScores.map(([team, score], index) => `
            <div class="team-score ${index === 0 ? 'winner' : ''}">
                <span class="team-name">${index + 1}. ${team}</span>
                <span class="team-points">${score}</span>
            </div>
        `).join('');
    }

    // עזרים
    playSound(type) {
        // ניתן להוסיף כאן הפעלת אפקטים קוליים
        if (type === 'correct') {
            // אפקט קולי לתשובה נכונה
        }
    }

    toggleDoubleBet() {
        this.doubleBetMode = !this.doubleBetMode;
        const doubleBetElement = document.getElementById('doubleBet');
        if (doubleBetElement) {
            doubleBetElement.style.display = this.doubleBetMode ? 'block' : 'none';
        }
    }
}

// יצירת מופע אפליקציה גלובלי
window.quizApp = new QuizApp();