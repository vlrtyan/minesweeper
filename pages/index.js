const config = {
  emojiButton: document.querySelector(".board__button"),
  gameBoard: document.querySelector(".board__game"),
  flagButton: document.querySelector(".board__flag-button"),
  //счетчик мин
  mineCounterHundreds: document.querySelector(".mine-counter_type_hundreds"),
  mineCounterTens: document.querySelector(".mine-counter_type_tens"),
  mineCounterOnes: document.querySelector(".mine-counter_type_ones"),
  //секундомер
  stopwatchHundreds: document.querySelector(".stopwatch_type_hundreds"),
  stopwatchTens: document.querySelector(".stopwatch_type_tens"),
  stopwatchOnes: document.querySelector(".stopwatch_type_ones"),
};

const leftButtonCode = 0;
const rows = 16;
const columns = 16;
const minesNumber = 40;

let board = [];
let minesCoordinates = [];
let firstClick = true;
let clickedSquares = 0;
let stopwatch;
let flagButtonActive = false;

window.onload = () => {
  setBoard();
  config.emojiButton.addEventListener("click", handleEmojiButtonClick);
  config.flagButton.addEventListener("click", handleFlagButtonClick);
  setMineCounter();
  setTime(0);
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
}
function setEventListeners(square) {
  square.addEventListener("contextmenu", handleRightClick);
  square.addEventListener("mousedown", handleMouseDown);
  square.addEventListener("click", handleClick);
}
function removeEventListeners(square) {
  square.removeEventListener("contextmenu", handleRightClick);
  square.removeEventListener("mousedown", handleMouseDown);
  square.removeEventListener("click", handleClick);
  square.classList.add("square_type_disabled");
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
  if (flagButtonActive) {
    square.classList.toggle("square_type_flagged");
    setMineCounter();
  } else {
    //клик левой кнопкой мыши
    if (e.button === leftButtonCode) {
      //клик по мине
      if (minesCoordinates.includes(square.id)) {
        square.className = "square square_type_exploded";
        lose();
      } else {
        getNumberOfMinesAround(Number(id[0]), Number(id[1]));
      }
    }
  }
}
function handleRightClick(e) {
  e.preventDefault();
  let square = this;
  if (firstClick) {
    //сгенирировать бомбы
    getRandomMines(square.id);
    startTime();
    firstClick = false;
  }
  switch (square.className) {
    case "square square_type_flagged":
      square.classList.replace("square_type_flagged", "square_type_question");
      break;
    case "square square_type_question":
      square.classList.remove("square_type_question");
      square.addEventListener("click", handleClick);
      break;
    default:
      square.classList.add("square_type_flagged");
      square.removeEventListener("click", handleClick);
      break;
  }
  setMineCounter();
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
function handleFlagButtonClick(e) {
  flagButtonActive = !flagButtonActive;
  e.target.classList.toggle("board__flag-button_active");
}
function setTime(number) {
  let digits = splitNumber(number);
  config.stopwatchHundreds.className = `board__counter-number stopwatch_type_hundreds counter_type_${digits[2]}`;
  config.stopwatchTens.className = `board__counter-number stopwatch_type_tens counter_type_${digits[1]}`;
  config.stopwatchOnes.className = `board__counter-number stopwatch_type_ones counter_type_${digits[0]}`;
}
//запустить секундомер
function startTime() {
  let stopwatchCount = 0;
  stopwatch = setInterval(() => {
    stopwatchCount++;
    if (stopwatchCount < 1000) {
      setTime(stopwatchCount);
    }
  }, 1000);
}
//счетчик мин
function setMineCounter() {
  let minesLeft =
    minesNumber - document.querySelectorAll(".square_type_flagged").length;
  if (minesLeft >= 0) {
    let digits = splitNumber(minesLeft);
    config.mineCounterHundreds.className = `board__counter-number mine-counter_type_hundreds counter_type_${digits[2]}`;
    config.mineCounterTens.className = `board__counter-number mine-counter_type_tens counter_type_${digits[1]}`;
    config.mineCounterOnes.className = `board__counter-number mine-counter_type_ones counter_type_${digits[0]}`;
  }
}
function handleEmojiButtonClick() {
  config.emojiButton.className = "board__button board__button_type_smiling";
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
  square.className = "square square_type_empty";
  removeEventListeners(square);
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
  setMineCounter();
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
function revealMines(result) {
  for (let rowIndex = 0; rowIndex < rows; rowIndex++) {
    for (let columnIndex = 0; columnIndex < columns; columnIndex++) {
      const square = board[rowIndex][columnIndex];
      removeEventListeners(square);
      //показать мины
      if (minesCoordinates.includes(square.id)) {
        //если клетка заминирована, но нет флажка
        if (!square.classList.contains("square_type_flagged")) {
          switch (result) {
            case "win":
              square.classList.add("square_type_flagged"); //флаг в случае победы
              break;
            case "lose":
              square.classList.add("square_type_mined"); //мина в случае проигрыша
              break;
          }
        }
      } else {
        //если клетка не заминирована, но флажок есть
        if (square.classList.contains("square_type_flagged")) {
          square.classList.add("square_type_mistake");
        }
      }
    }
  }
}
function lose() {
  revealMines("lose");
  clearInterval(stopwatch);
  config.emojiButton.classList.add("board__button_type_sad");
}
function win() {
  revealMines("win");
  clearInterval(stopwatch);
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
  clearInterval(stopwatch);
  setTime(0);
  setMineCounter();
}
