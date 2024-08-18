let currentWord;

document.addEventListener('DOMContentLoaded', function() {
  loadRandomWord();

  document.getElementById('learnedCheckbox').addEventListener('change', function() {
    if (this.checked) {
      markWordAsLearned(currentWord);
    } else {
      unmarkWordAsLearned(currentWord);
    }
  });

  document.getElementById('favoriteButton').addEventListener('click', function() {
    toggleFavoriteWord(currentWord);
  });

  document.getElementById('viewLearnedWords').addEventListener('click', function() {
    window.location.href = 'learned.html';
  });

  document.getElementById('viewFavoriteWords').addEventListener('click', function() {
    window.location.href = 'favorites.html';
  });

  document.getElementById('refreshButton').addEventListener('click', loadRandomWord);

  document.getElementById('closeButton').addEventListener('click', function() {
    window.close();
  });
});

function loadRandomWord() {
  fetch(chrome.runtime.getURL('words.json'))
    .then(response => response.json())
    .then(data => {
      currentWord = data[Math.floor(Math.random() * data.length)];
      document.getElementById('word').innerHTML = `<b>Word: </b>${currentWord.word}`;
      document.getElementById('meaning').innerHTML = `<b>Meaning: </b>${currentWord.meaning}`;
      document.getElementById('phon-tran').innerHTML = `<b>Pronunciation Tip: </b>${currentWord.pron_tip}`;
      checkIfWordLearned(currentWord);
      checkIfWordFavorited(currentWord);
    })
    .catch(error => {
      console.error('Error fetching the word:', error);
    });
}

function checkIfWordLearned(word) {
  chrome.storage.sync.get('learnedWords', function(data) {
    const learnedWords = data.learnedWords || [];
    const isLearned = learnedWords.some(w => w.word === word.word);
    document.getElementById('learnedCheckbox').checked = isLearned;
  });
}

function checkIfWordFavorited(word) {
  chrome.storage.sync.get('favoriteWords', function(data) {
    const favoriteWords = data.favoriteWords || [];
    const isFavorited = favoriteWords.some(w => w.word === word.word);
    const favoriteButton = document.getElementById('favoriteButton');
    favoriteButton.innerHTML = isFavorited ? '&#x2665;' : '&#x2661;';
    favoriteButton.classList.toggle('filled', isFavorited);
  });
}

function toggleFavoriteWord(word) {
  chrome.storage.sync.get('favoriteWords', function(data) {
    let favoriteWords = data.favoriteWords || [];
    const isFavorited = favoriteWords.some(w => w.word === word.word);
    if (isFavorited) {
      favoriteWords = favoriteWords.filter(w => w.word !== word.word);
    } else {
      favoriteWords.push(word);
    }
    chrome.storage.sync.set({ favoriteWords: favoriteWords }, function() {
      checkIfWordFavorited(word);
    });
  });
}

function markWordAsLearned(word) {
  chrome.storage.sync.get('learnedWords', function(data) {
    let learnedWords = data.learnedWords || [];
    if (!learnedWords.some(w => w.word === word.word)) {
      learnedWords.push(word);
    }
    chrome.storage.sync.set({ learnedWords: learnedWords });
  });
}

function unmarkWordAsLearned(word) {
  chrome.storage.sync.get('learnedWords', function(data) {
    let learnedWords = data.learnedWords || [];
    learnedWords = learnedWords.filter(w => w.word !== word.word);
    chrome.storage.sync.set({ learnedWords: learnedWords });
  });
}
