if ("serviceWorker" in navigator) {
  window.addEventListener("load", function() {
    navigator.serviceWorker
      .register("/service-worker.js", { scope: "/" })
      .then(function(registration) {
        console.log("SW registered: ", registration);
      })
      .catch(function(registrationError) {
        console.log("SW registration failed: ", registrationError);
      });
  });
}
