const config = {
  emojiButton: document.querySelector(".board__button"),
  gameBoard: document.querySelector(".board__game"),
  //timer
  timerHundreds: document.querySelector(".timer_type_hundreds"),
  timerTens: document.querySelector(".timer_type_tens"),
  timerOnes: document.querySelector(".timer_type_ones"),
  //stopwatch
  stopwatchHundreds: document.querySelector(".stopwatch_type_hundreds"),
  stopwatchTens: document.querySelector(".stopwatch_type_tens"),
  stopwatchOnes: document.querySelector(".stopwatch_type_ones"),
};

const leftButtonCode = 0;
const maxTime = 40; //минут
const rows = 16;
const columns = 16;
const minesNumber = 40;

let board = [];
let minesCoordinates = [];
let firstClick = true;
let clickedSquares = 0;
let stopwatch;
let timer;

window.onload = () => {
  setBoard();
  config.emojiButton.addEventListener("click", handleEmojiButtonClick);
};

//УТИЛИТЫ
//делит число на разряды
function splitNumber(number) {
  let digits = [];
  while (number) {
    digits.push(number % 10);
    number = Math.floor(number / 10);
  }
  return digits;
}
function getRandomCoordinates() {
  const mineRow = Math.floor(Math.random() * rows);
  const mineColumn = Math.floor(Math.random() * columns);
  const mineCoordinates = `${mineRow}-${mineColumn}`;
  return mineCoordinates;
}

//ЛОГИКА ИГРЫ
function setBoard() {
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    let row = [];
    for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
      const square = document
        .querySelector("#squareTemplate")
        .content.querySelector(".square")
        .cloneNode(true);
      square.id = rowIndex.toString() + "-" + columnIndex.toString();
      //повесить слушатели
      setEventListeners(square);
      //отрисовать клетки
      config.gameBoard.append(square);
      row.push(square);
    }
    board.push(row);
  }
  //установить значение таймера
  setTime("timer", maxTime);
}
function setEventListeners(square) {
  square.addEventListener("contextmenu", handleRightClick);
  square.addEventListener("mousedown", handleMouseDown);
  square.addEventListener("click", handleClick);
}
//генерация мин
function getRandomMines(firstClickCoordinates) {
  while (minesCoordinates.length != minesNumber) {
    let mineCoordinates = getRandomCoordinates();
    if (
      !minesCoordinates.includes(mineCoordinates) && //проверка на дубликаты
      mineCoordinates !== firstClickCoordinates //первый клик не по мине
    ) {
      minesCoordinates.push(mineCoordinates);
    }
  }
}
function handleClick(e) {
  let square = this;
  const id = square.id.split("-");
  if (firstClick) {
    //сгенирировать бомбы
    getRandomMines(square.id);
    startTime();
    firstClick = false;
  }
  //клик левой кнопкой мыши
  if (e.button === leftButtonCode) {
    //клик по мине
    if (minesCoordinates.includes(square.id)) {
      square.className = "square square_type_exploded";
      revealMines();
      lose();
    } else {
      getNumberOfMinesAround(Number(id[0]), Number(id[1]));
    }
  }
}
function handleRightClick(e) {
  e.preventDefault();
  let square = this;
  switch (square.className) {
    case "square square_type_flagged":
      square.classList.replace("square_type_flagged", "square_type_question");
      break;
    case "square square_type_question":
      square.classList.remove("square_type_question");
      break;
    default:
      square.classList.add("square_type_flagged");
      break;
  }
}
function handleMouseDown(e) {
  //клик левой кнопкой мыши
  if (e.button === leftButtonCode) {
    config.emojiButton.classList.add("board__button_type_surprised");
    window.addEventListener("mouseup", () => {
      config.emojiButton.classList.remove("board__button_type_surprised");
    });
  }
}
//запустить секундомер и таймер
function startTime() {
  let timerCount = maxTime;
  let stopwatchCount = 0;
  stopwatch = setInterval(() => {
    stopwatchCount++;
    setTime("stopwatch", stopwatchCount);
    if (stopwatchCount > maxTime * 60) {
      lose();
    }
  }, 1000);
  timer = setInterval(() => {
    timerCount--;
    if (timerCount === 0) {
      lose();
    }
    setTime("timer", timerCount);
  }, 1000 * 60);
}
//остановить секундомер и таймер
function stopTime() {
  clearInterval(timer);
  clearInterval(stopwatch);
}
function setTime(type, number) {
  let digits = splitNumber(number);
  switch (type) {
    case "timer":
      config.timerHundreds.className = `board__counter-number timer_type_hundreds counter_type_${digits[2]}`;
      config.timerTens.className = `board__counter-number timer_type_tens counter_type_${digits[1]}`;
      config.timerOnes.className = `board__counter-number timer_type_ones counter_type_${digits[0]}`;
      break;
    case "stopwatch":
      config.stopwatchHundreds.className = `board__counter-number stopwatch_type_hundreds counter_type_${digits[2]}`;
      config.stopwatchTens.className = `board__counter-number stopwatch_type_tens counter_type_${digits[1]}`;
      config.stopwatchOnes.className = `board__counter-number stopwatch_type_ones counter_type_${digits[0]}`;
      break;
  }
}
function handleEmojiButtonClick() {
  config.emojiButton.className = "board__button";
  restartGame();
}
function getNumberOfMinesAround(rowIndex, columnIndex) {
  if (
    //клетка вне поля
    rowIndex < 0 ||
    columnIndex < 0 ||
    rowIndex >= rows ||
    columnIndex >= columns
  ) {
    return;
  }
  let minesCount = 0;
  let square = board[rowIndex][columnIndex];
  if (square.classList.contains("square_type_empty")) {
    return;
  }
  clickedSquares += 1;
  square.classList.add("square_type_empty");
  //3 верхние клетки
  minesCount += isSquareMined(rowIndex - 1, columnIndex - 1);
  minesCount += isSquareMined(rowIndex - 1, columnIndex);
  minesCount += isSquareMined(rowIndex - 1, columnIndex + 1);
  //3 нижние клетки
  minesCount += isSquareMined(rowIndex + 1, columnIndex - 1);
  minesCount += isSquareMined(rowIndex + 1, columnIndex);
  minesCount += isSquareMined(rowIndex + 1, columnIndex + 1);
  //по 1 клетке слева и справа
  minesCount += isSquareMined(rowIndex, columnIndex - 1);
  minesCount += isSquareMined(rowIndex, columnIndex + 1);

  if (minesCount > 0) {
    square.classList.add(`square_type_${minesCount}`);
  } else {
    //3 верхние клетки
    getNumberOfMinesAround(rowIndex - 1, columnIndex - 1);
    getNumberOfMinesAround(rowIndex - 1, columnIndex);
    getNumberOfMinesAround(rowIndex - 1, columnIndex + 1);
    //3 нижние клетки
    getNumberOfMinesAround(rowIndex + 1, columnIndex - 1);
    getNumberOfMinesAround(rowIndex + 1, columnIndex);
    getNumberOfMinesAround(rowIndex + 1, columnIndex + 1);
    //по 1 клетке слева и справа
    getNumberOfMinesAround(rowIndex, columnIndex - 1);
    getNumberOfMinesAround(rowIndex, columnIndex + 1);
  }
  if (clickedSquares === rows * columns - minesNumber) {
    win();
  }
}
function isSquareMined(rowIndex, columnIndex) {
  if (
    //клетка вне поля
    rowIndex < 0 ||
    columnIndex < 0 ||
    rowIndex >= rows ||
    columnIndex >= columns
  ) {
    return 0;
  } else {
    return minesCoordinates.includes(`${rowIndex}-${columnIndex}`) ? 1 : 0;
  }
}
function revealMines() {
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
      const square = board[rowIndex][columnIndex];
      //показать мины
      if (minesCoordinates.includes(square.id)) {
        square.classList.add("square_type_mined");
      }
    }
  }
}
function stopGame() {
  document.querySelectorAll(".square").forEach((square) => {
    square.removeEventListener("contextmenu", handleRightClick);
    square.removeEventListener("mousedown", handleMouseDown);
    square.removeEventListener("click", handleClick);
    square.classList.add("square_type_disabled");
  });
  stopTime();
}
function lose() {
  stopGame();
  config.emojiButton.classList.add("board__button_type_sad");
}
function win() {
  stopGame();
  config.emojiButton.classList.add("board__button_type_sunglasses");
}
function restartGame() {
  clickedSquares = 0;
  firstClick = true;
  document.querySelectorAll(".square").forEach((i) => {
    i.className = "square";
    setEventListeners(i);
  });
  minesCoordinates = [];
  stopTime();
  setTime("stopwatch", 0);
  setTime("timer", maxTime);
}
