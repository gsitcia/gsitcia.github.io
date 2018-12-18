var swReg;

const publicKey = 'BM-flUqQkyu27Z6a1GeaLy83_Fz7dF9ekyotnNODZEOibu8dX-lMVkHusig-iKS0FaRzO2nEC66x2DFHlCSeN2U';
const privateKey = 'R87DofLRRFS_eC2WazotxQ2AB1u8XeW36bK9mCUCQgs';

function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - base64String.length % 4) % 4);
  var base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');
  var rawData = window.atob(base64);
  var outputArray = new Uint8Array(rawData.length);
  for (var i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

var subscribeUser = function() {
  const applicationServerKey = urlBase64ToUint8Array(publicKey);
  swReg.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: applicationServerKey
  })
  .then(function(sub) {
    console.log('Subscribed');
    updateSubscription(sub);
  })
  .catch(function(err) {
    console.error('Subscribe fail',err);
  });
}

var updateSubscription = function(s) {
  document.getElementById('lolol').innerText = JSON.stringify(s);
}

var start = function() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');
    navigator.serviceWorker.register('sw.js')
    .then(function(sr) {
      console.log('Service Worker Registered', sr);
      swReg = sr;
      subscribeUser();
    })
    .catch(function(err) {
      console.error('Service Worker Error',err);
    });
  } else {
    console.warn('Push not supported');
  }
}

var part1 = function() {
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    console.log('Service Worker and Push is supported');
    navigator.serviceWorker.register('sw.js')
    .then(function(sr) {
      console.log('Service Worker Registered', sr);
      swReg = sr;
    })
    .catch(function(err) {
      console.error('Service Worker Error',err);
    });
  } else {
    console.warn('Push not supported');
  }
}