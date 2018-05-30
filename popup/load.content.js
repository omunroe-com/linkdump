function deleteItem(event) {
  browser.runtime.sendMessage({
    action: 'delete',
    payload: event.target.dataset.index
  });
}

function drawContent() {
  document.querySelector('#clear').textContent = browser.i18n.getMessage('popupButtonClear');
  document.querySelector('#popup-content').innerHTML = '';
  document.querySelectorAll('[data-action="download"],[data-action="copy"]').forEach(item => {
    const action = item.dataset.action[0].toUpperCase() + item.dataset.action.slice(1);
    switch (item.tagName.toLowerCase()) {
      case 'button':
        item.textContent = browser.i18n.getMessage(`popupButtonDefault${action}`);
        break;
      default:
        item.textContent = browser.i18n.getMessage(`popupButton${action}`, item.dataset.type);
    }
  });

  browser.storage.local.get('urls').then(obj => {
    if (obj.urls && obj.urls.length !== 0) {
      obj.urls.forEach((item, index) => {
        const listItem = document.createElement('p');
        const itemLink = document.createElement('a');
        itemLink.href = item.url;
        itemLink.textContent = item.title;
        const itemDelete = document.createElement('button');
        itemDelete.dataset.index = index;
        itemDelete.onclick = deleteItem;
        itemDelete.classList = 'delete'
        const deleteImage = document.createElement('img');
        deleteImage.src = browser.extension.getURL('icons/trash-48.png');
        itemDelete.appendChild(deleteImage);

        listItem.appendChild(itemDelete);
        listItem.appendChild(itemLink);

        document.querySelector('#popup-content').appendChild(listItem);
      });
    } else {
      const emptyItem = document.createElement('p');
      emptyItem.textContent = browser.i18n.getMessage('popupContentEmpty');
      document.querySelector('#popup-content').appendChild(emptyItem);
      document.querySelectorAll('div').forEach(item => {
        if (item.id !== 'popup-content') {
          item.classList.add('empty');
        }
      });
    }
  });
}

function copyToClipboard(content) {
  const textarea = document.createElement('textarea');
  textarea.textContent = content;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
  browser.runtime.sendMessage({
    action: 'copied'
  }).then(window.close());
}

function buttonToggle(element) {
  element.parentNode.classList.toggle('show');
  element.nextElementSibling.classList.toggle('show');
  const expanded = element.getAttribute('aria-expanded') === 'true' ? 'false' : 'true';
  element.setAttribute('aria-expanded', expanded);
}

document.querySelectorAll('[data-action="download"],[data-action="copy"]').forEach(item => {
  item.addEventListener('click', (event) => {
    browser.runtime.sendMessage({
      action: event.target.dataset.action,
      payload: event.target.dataset.type
    });
  });
});

document.querySelector('#clear').addEventListener('click', () => {
  browser.runtime.sendMessage({
    action: 'clear'
  }).then(window.close());
});

document.querySelectorAll('.dropdown-toggle').forEach(item => {
  item.addEventListener('click', (event) => {
    buttonToggle(event.target);
  });
});

function handleMessage(message) {
  switch (message.action) {
    case 'reload':
      drawContent();
      break;
    case 'copy':
      copyToClipboard(message.payload);
      break;
    default:
      // Do nothing on purpose
  }
}

browser.runtime.onMessage.addListener(handleMessage);
drawContent();
