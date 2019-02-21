class App {

  constructor() {
    if (navigator.serviceWorker) {
      navigator.serviceWorker.register('/sw.js');
    }
    this.bindEvents()
    this.initImages()
  }

  initImages() {
    fetch('/uploads')
      .then(res => res.json())
      .then((files) => {
        files.forEach((file) => this.addImage(file))
      })
  }

  bindEvents() {
    document.querySelector('#file').addEventListener('input', (e) => {
      this.getBase64(e.target.files[0]).then((b64) => {
        fetch('/upload', {
          method: 'POST',
          body: JSON.stringify({data: b64})
        }).then(resp => resp.json())
          .then((data) => {
            this.addImage(data.file)
            this.synchronizeImages()
          })
      })
    })
  }

  synchronizeImages() {
    const message = new MessageChannel();
    message.port1.onmessage = function (ev) {
      Notification.requestPermission(function (status) {
        const n = new Notification("Synchronization", {body: "Background synchronization OK"});
        setTimeout(() => {
          n.close()
        }, 1000)
      });
    }
    navigator.serviceWorker.controller.postMessage('', [message.port2]);
  }

  getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  addImage(file) {
    const images = document.querySelector('#images')
    const div = document.createElement('div')
    //div.setAttribute('class')
    const image = document.createElement('img')
    image.setAttribute('src', file)
    image.setAttribute('width', 100)
    div.appendChild(image)
    div.addEventListener('click', () => {
      this.deleteImage(file)
    })
    images.appendChild(div)
  }

  deleteImage(file) {
    fetch(`/upload?file=${file}`, {
      method: 'DELETE'
    }).then(() => {
      document.querySelector(`img[src="${file}"]`).remove()
      this.synchronizeImages()
    })
  }

}

new App()