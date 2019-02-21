function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
}

function offlineAddImage(db, file) {
  return db.then((db) => {
    const tx = db.transaction('images', 'readwrite');
    const store = tx.objectStore('images')
    store.add(file)
    return tx.complete
  })
}

function onlineAddImage(file) {
  return getBase64(file).then((b64) => {
    fetch('/upload', {
      method: 'POST',
      body: JSON.stringify({data: b64})
    }).then(resp => resp.json())
  })
}