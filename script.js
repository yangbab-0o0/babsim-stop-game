// Screens
const screenLoading = document.getElementById('screen-loading');
const screenGuide = document.getElementById('screen-guide');
const screenGame = document.getElementById('screen-game');
const screenResult = document.getElementById('screen-result');

// Game Elements
const timerDisplay = document.getElementById('timer');
const touchLayer = document.getElementById('touch-layer');
const tapEffectsContainer = document.getElementById('tap-effects');
const gameContainer = document.getElementById('game-container');

// Backgrounds (Images)
const bg10 = document.getElementById('game-bg-10');
const bg8 = document.getElementById('game-bg-8');
const bg5 = document.getElementById('game-bg-5');
const bg1 = document.getElementById('game-bg-1');

// Result Elements
const resultBg = document.getElementById('result-bg');

let score = 0;
let timeLeft = 10.0;
let gameInterval;
let isPlaying = false;
let isEnding = false; // 타임오버 연출 중인지 확인하는 변수 추가

// 초기화
function init() {
    // 2.5초 후 로딩 화면(img1)에서 안내 화면(img2)으로 자동 전환
    setTimeout(() => {
        screenLoading.classList.add('hidden');
        screenGuide.classList.remove('hidden');
    }, 2500);

    // 안내 화면의 빨간 버튼 영역 클릭 시 게임 시작
    document.getElementById('start-hotspot').addEventListener('click', startGame);

    // 게임 화면 터치/클릭 이벤트
    touchLayer.addEventListener('mousedown', handleTap);
    touchLayer.addEventListener('touchstart', (e) => {
        e.preventDefault(); // 모바일 브라우저 더블탭 줌 등 방지
        handleTap(e);
    }, { passive: false });

    // 결과 화면의 빨간 버튼 영역 클릭 시 다시 시작
    document.getElementById('restart-hotspot').addEventListener('click', resetGame);
}

function startGame() {
    if (isPlaying) return;

    screenGuide.classList.add('hidden');
    screenGame.classList.remove('hidden');

    score = 0;
    timeLeft = 10.0;
    isPlaying = true;

    timerDisplay.textContent = timeLeft.toFixed(1);
    timerDisplay.style.color = '#87CEEB';

    // 배경 초기화 (10초 이미지 활성화)
    bg10.classList.add('active-bg');
    bg8.classList.remove('active-bg');
    bg5.classList.remove('active-bg');
    bg1.classList.remove('active-bg');

    // 타이머 시작
    gameInterval = setInterval(updateTimer, 100);
}

function updateTimer() {
    timeLeft -= 0.1;

    if (timeLeft <= 0) {
        timeLeft = 0;
        endGame();
    }

    timerDisplay.textContent = timeLeft.toFixed(1);

    // 시간에 따른 타이머 색상 변경 (하늘색 -> 주황색 -> 빨간색)
    if (timeLeft > 5) {
        timerDisplay.style.color = '#87CEEB'; // 하늘색
    } else if (timeLeft > 2) {
        timerDisplay.style.color = '#FFA500'; // 주황색
    } else {
        timerDisplay.style.color = '#FF1744'; // 빨간색
    }
}

function updateBackgroundByScore() {
    // 점수별 배경 이미지 크로스페이드 트랜지션 (25, 50, 75점 기준)
    // 기존 이미지를 지우지 않고 새 이미지를 그 위에 덧씌우는 방식으로 변경하여 어두워지는 현상 방지
    if (score >= 25 && score < 50) {
        if (!bg8.classList.contains('active-bg')) {
            bg8.classList.add('active-bg');
        }
    }
    else if (score >= 50 && score < 75) {
        if (!bg5.classList.contains('active-bg')) {
            bg5.classList.add('active-bg');
        }
    }
    else if (score >= 75) {
        if (!bg1.classList.contains('active-bg')) {
            bg1.classList.add('active-bg');
        }
    }
}

function handleTap(e) {
    if (!isPlaying) return;

    score++;
    updateBackgroundByScore();
    createTapEffect(e);
}

function createTapEffect(e) {
    const effect = document.createElement('div');
    effect.classList.add('tap-effect');
    effect.textContent = '+1';

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    const rect = gameContainer.getBoundingClientRect();
    const x = clientX - rect.left - 30; // 약간 보정
    const y = clientY - rect.top - 30;

    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;

    tapEffectsContainer.appendChild(effect);

    // 애니메이션이 끝나면 DOM에서 제거
    setTimeout(() => {
        if (tapEffectsContainer.contains(effect)) {
            tapEffectsContainer.removeChild(effect);
        }
    }, 600);
}

function endGame() {
    isPlaying = false;
    isEnding = true; // 타임오버 연출 시작
    clearInterval(gameInterval);

    // 타임오버 배경(img7) 먼저 표시
    resultBg.src = 'babsim_img7.jpg';
    screenGame.classList.add('hidden');
    screenResult.classList.remove('hidden');

    // 타임오버 화면에서는 다시하기 버튼을 숨김 처리하여 눌리지 않도록 함
    document.getElementById('restart-hotspot').classList.add('hidden');

    // 1.5초 후 점수에 따른 엔딩 이미지 전체화면 적용 (밥 단계 상향에 맞춰 엔딩 기준도 조율)
    setTimeout(() => {
        if (score < 35) {
            resultBg.src = 'ending_img1.png';
        } else if (score < 50) {
            resultBg.src = 'ending_img2.png';
        } else if (score < 65) {
            resultBg.src = 'ending_img3.png';
        } else if (score < 80) {
            resultBg.src = 'ending_img4.png';
        } else {
            resultBg.src = 'ending_img5.png';
        }

        isEnding = false; // 연출 종료, 다시하기 가능
        // 엔딩 이미지가 표시된 후 다시하기 버튼을 활성화
        document.getElementById('restart-hotspot').classList.remove('hidden');
    }, 1500);
}

function resetGame() {
    if (isEnding) return; // 타임오버 연출 중에는 무조건 재시작을 막음

    screenResult.classList.add('hidden');
    screenGuide.classList.remove('hidden');
    tapEffectsContainer.innerHTML = '';
}

// 앱 시작
init();
