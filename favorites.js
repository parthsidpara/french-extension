document.addEventListener('DOMContentLoaded', function() {
    const favoriteWordsList = document.getElementById('favoriteWordsList');
    const backButton = document.getElementById('backButton');
    const prevPageButton = document.getElementById('prevPage');
    const nextPageButton = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const removeButton = document.getElementById('removeButton');
    const itemsPerPage = 7;
    let currentPage = 1;
    let favoriteWords = [];
    let selectedWord = null;

    chrome.storage.sync.get('favoriteWords', function(data) {
      favoriteWords = data.favoriteWords || [];
      updatePagination();
      displayFavoriteWords();
    });

    prevPageButton.addEventListener('click', function() {
      if (currentPage > 1) {
        currentPage--;
        updatePagination();
        displayFavoriteWords();
      }
    });

    nextPageButton.addEventListener('click', function() {
      if (currentPage * itemsPerPage < favoriteWords.length) {
        currentPage++;
        updatePagination();
        displayFavoriteWords();
      }
    });

    backButton.addEventListener('click', function() {
      window.location.href = 'popup.html';
    });

    removeButton.addEventListener('click', function() {
      if (selectedWord) {
        favoriteWords = favoriteWords.filter(w => w.word !== selectedWord.word);
        chrome.storage.sync.set({ favoriteWords: favoriteWords }, function() {
          selectedWord = null;
          removeButton.disabled = true;
          updatePagination();
          displayFavoriteWords();
        });
      }
    });

    document.getElementById('closeButton').addEventListener('click', function() {
      window.close();
    });

    function updatePagination() {
      pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(favoriteWords.length / itemsPerPage)}`;
      prevPageButton.disabled = currentPage === 1;
      nextPageButton.disabled = currentPage * itemsPerPage >= favoriteWords.length;
    }

    function displayFavoriteWords() {
      favoriteWordsList.innerHTML = '';
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage;
      const wordsToShow = favoriteWords.slice(start, end);

      wordsToShow.forEach(wordObj => {
        const listItem = document.createElement('li');
        listItem.textContent = `${wordObj.word}: ${wordObj.meaning}`;
        listItem.dataset.word = wordObj.word;
        listItem.dataset.meaning = wordObj.meaning;
        listItem.addEventListener('click', function() {
          selectWord(wordObj);
        });
        favoriteWordsList.appendChild(listItem);
      });
    }

    function selectWord(wordObj) {
      selectedWord = wordObj;
      removeButton.disabled = false;
      const items = favoriteWordsList.querySelectorAll('li');
      items.forEach(item => item.classList.remove('selected'));
      const selectedItem = [...items].find(item => item.dataset.word === wordObj.word);
      if (selectedItem) {
        selectedItem.classList.add('selected');
      }
    }
});
