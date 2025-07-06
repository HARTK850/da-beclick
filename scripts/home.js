// JavaScript עבור דף הבית
document.addEventListener('DOMContentLoaded', function() {
    // אנימציה של הלוגו
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', function() {
            this.style.transform = 'scale(1.1) rotate(5deg)';
            setTimeout(() => {
                this.style.transform = 'scale(1) rotate(0deg)';
            }, 200);
        });
    }

    // אנימציה של הכפתורים
    const actionButtons = document.querySelectorAll('.action-btn');
    actionButtons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // אנימציה של הצורות הרקע
    const shapes = document.querySelectorAll('.floating-shape');
    shapes.forEach((shape, index) => {
        shape.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.2)';
            this.style.opacity = '0.3';
        });
        
        shape.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
            this.style.opacity = '0.1';
        });
        
        // אנימציה רנדומלית
        setInterval(() => {
            const randomX = Math.random() * 20 - 10;
            const randomY = Math.random() * 20 - 10;
            shape.style.transform = `translate(${randomX}px, ${randomY}px)`;
        }, 3000 + index * 1000);
    });

    // אפקט פרטיקלים נוסף
    createParticles();
});

// פונקציות ניווט
function goToEditor() {
    // אנימציה של יציאה
    document.body.style.opacity = '0.8';
    document.body.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        window.location.href = 'editor.html';
    }, 300);
}

function goToPlayer() {
    // אנימציה של יציאה
    document.body.style.opacity = '0.8';
    document.body.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        window.location.href = 'player.html';
    }, 300);
}

// יצירת פרטיקלים אנימציה
function createParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.style.position = 'fixed';
    particleContainer.style.top = '0';
    particleContainer.style.left = '0';
    particleContainer.style.width = '100%';
    particleContainer.style.height = '100%';
    particleContainer.style.pointerEvents = 'none';
    particleContainer.style.zIndex = '1';
    document.body.appendChild(particleContainer);

    function createParticle() {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.backgroundColor = getRandomColor();
        particle.style.borderRadius = '50%';
        particle.style.opacity = '0.6';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = '100%';
        particle.style.animation = `floatUp ${3 + Math.random() * 3}s linear forwards`;
        
        particleContainer.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 6000);
    }

    function getRandomColor() {
        const colors = ['#8B5CF6', '#EC4899', '#06B6D4', '#F59E0B', '#FCD34D'];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // יצירת פרטיקל כל 2 שניות
    setInterval(createParticle, 2000);
}

// הוספת CSS לאנימציה
const style = document.createElement('style');
style.textContent = `
    @keyframes floatUp {
        0% {
            transform: translateY(0) scale(0);
            opacity: 0.6;
        }
        10% {
            transform: translateY(-10px) scale(1);
            opacity: 0.8;
        }
        90% {
            transform: translateY(-100vh) scale(1);
            opacity: 0.3;
        }
        100% {
            transform: translateY(-100vh) scale(0);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);