document.addEventListener('DOMContentLoaded', function() {
  const learnedWordsList = document.getElementById('learnedWordsList');
  const backButton = document.getElementById('backButton');
  const prevPageButton = document.getElementById('prevPage');
  const nextPageButton = document.getElementById('nextPage');
  const pageInfo = document.getElementById('pageInfo');
  const removeButton = document.getElementById('removeButton');
  const itemsPerPage = 7;
  let currentPage = 1;
  let learnedWords = [];
  let selectedWord = null;

  chrome.storage.sync.get('learnedWords', function(data) {
      learnedWords = data.learnedWords || [];
      updatePagination();
      displayLearnedWords();
  });

  prevPageButton.addEventListener('click', function() {
      if (currentPage > 1) {
          currentPage--;
          updatePagination();
          displayLearnedWords();
      }
  });

  nextPageButton.addEventListener('click', function() {
      if (currentPage * itemsPerPage < learnedWords.length) {
          currentPage++;
          updatePagination();
          displayLearnedWords();
      }
  });

  backButton.addEventListener('click', function() {
      window.location.href = 'popup.html';
  });

  removeButton.addEventListener('click', function() {
      if (selectedWord) {
          learnedWords = learnedWords.filter(w => w.word !== selectedWord.word);
          chrome.storage.sync.set({ learnedWords: learnedWords }, function() {
              selectedWord = null;
              removeButton.disabled = true;
              updatePagination();
              displayLearnedWords();
          });
      }
  });

  document.getElementById('closeButton').addEventListener('click', function() {
      window.close();
  });

  function updatePagination() {
      pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(learnedWords.length / itemsPerPage)}`;
      prevPageButton.disabled = currentPage === 1;
      nextPageButton.disabled = currentPage * itemsPerPage >= learnedWords.length;
  }

  function displayLearnedWords() {
      learnedWordsList.innerHTML = '';
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const wordsToShow = learnedWords.slice(start, end);

      wordsToShow.forEach(wordObj => {
          const listItem = document.createElement('li');
          listItem.textContent = `${wordObj.word}: ${wordObj.meaning}`;
          listItem.dataset.word = wordObj.word;
          listItem.dataset.meaning = wordObj.meaning;
          listItem.addEventListener('click', function() {
              selectWord(wordObj);
          });
          learnedWordsList.appendChild(listItem);
      });
  }

  function selectWord(wordObj) {
      selectedWord = wordObj;
      removeButton.disabled = false;
      const items = learnedWordsList.querySelectorAll('li');
      items.forEach(item => item.classList.remove('selected'));
      const selectedItem = [...items].find(item => item.dataset.word === wordObj.word);
      if (selectedItem) {
          selectedItem.classList.add('selected');
      }
  }
});
