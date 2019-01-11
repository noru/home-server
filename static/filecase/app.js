!function(){

  function $(id) {
    return document.getElementById(id)
  }

  function reset() {
    $loading.style = $error.style = $succ.style = ''
    $fileInput.value = ''
  }

  function upload(files) {
    var token = prompt('You know what is this')
    var formData = new FormData()

    for (var i = 0; i < files.length; i++) {
      var f = files[i]
      formData.append(f.name, f);
    }

    var xhr = new XMLHttpRequest()
    xhr.open('POST', '/files?token=' + token + '&keep=' + $toVolumn.checked)
    xhr.send(formData)
    xhr.onprogress = function() {
      $loading.style = 'display: block'
    }
    xhr.onerror = function() {
      $error.style = 'display: block'
    }
    xhr.onload = function() {
      $loading.style = ''
      reset()
      if (this.status === 200) {
        $succ.style = 'display: block'
      } else {
        $error.style = 'display: block'
      }
    }
  }

  function deleteFile(e) {
    e.preventDefault()
    e.stopPropagation()
    var filename = e.target.filename
    var token = prompt('You know what it is ')
    var xhr = new XMLHttpRequest()
    xhr.open('DELETE', '/files/' + filename + '?token=' + token)
    xhr.send()
    xhr.onload = function() {
      if (this.status === 200) {
        loadFiles()
      } else {
        alert(this.status + ': Something is wrong')
      }
    }
  }

  function getATag(filename, isTemp) {
    var a = document.createElement('a')
    if (isTemp) {
      a.className = 'temp'
    }
    a.href = '/files/' + filename
    a.target = '__blank'
    a.innerText = filename
    var del = document.createElement('span')
    del.innerText = '🗑'
    del.filename = filename
    del.addEventListener('click', deleteFile)
    a.appendChild(del)
    return a
  }

  function loadFiles() {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', '/files')
    xhr.send()
    xhr.onload = function(e) {
      if (this.status === 200) {
        $fileList.innerText = ''
        var data = JSON.parse(this.responseText)
        ;(data.saved || []).forEach(function(filename) {
          $fileList.appendChild(getATag(filename))
        })
        ;(data.temp || []).forEach(function(filename) {
          $fileList.appendChild(getATag(filename, true))
        })
      } else {
        alert(this.status = ': Something is wrong')
      }
    }
  }


  function addListener(element, types, listener) {
    types.forEach(function(type) {
      element.addEventListener(type, listener)
    })
  }
  var isAdvancedUpload = function() {
    var div = document.createElement('div');
    return (('draggable' in div) || ('ondragstart' in div && 'ondrop' in div)) && 'FormData' in window && 'FileReader' in window
  }()

  var $form = $('uploader'),
      $filesBtn = $('file-list'),
      $uploadBtn = $('upload-file'),
      $toVolumn = $('upload-to-volumn'),
      $fileList = $('file-list-tab'),
      $fileInput = $('file'),
      $loading = $('loading-msg'),
      $error = $('err-msg'),
      $succ = $('succ-msg')

  function tabBtnClick(e) {
    $filesBtn.className = $uploadBtn.className = ''
    document.querySelectorAll('.tab').forEach(function(tab) {
      tab.style = ''
    })
    e.target.className = 'active'
    let activeTab = e.target.dataset['avtiveTab']
    $(activeTab).style = 'display: block'
  }

  $filesBtn.addEventListener('click', tabBtnClick)
  $filesBtn.addEventListener('click', loadFiles)
  $uploadBtn.addEventListener('click', tabBtnClick)
  $uploadBtn.addEventListener('click', reset)

  if (isAdvancedUpload) {

    $form.className += ' has-advanced-upload'

    addListener($form, ['drag', 'dragstart', 'dragend', 'dragover', 'dragenter', 'dragleave', 'drop'], function(e) {
      e.preventDefault()
      e.stopPropagation()
    })

    addListener($form, ['dragover', 'dragenter'], function() {
      // $form.className = 'is-dragover'
    })

    addListener($form, ['dragleave', 'dragend', 'drop'], function() {
      // $form.className = ''
    })

    addListener($form, ['drop'], function(e) {
      files = e.dataTransfer.files
      upload(files)
    })

    addListener($fileInput, ['change'], function(e) {
      upload(e.target.files)
    })

  }

  function init() {
    $filesBtn.click()
  }

  init()
}()