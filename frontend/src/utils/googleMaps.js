const GOOGLE_MAPS_API_KEY = String(
  import.meta.env.VITE_GOOGLE_MAPS_API_KEY || import.meta.env.VITE_GOOGLE_MAPS_EMBED_KEY || ""
).trim();

const SCRIPT_ID = "coffeeconnect-google-maps-script";

let googleMapsPromise;

export function getGoogleMapsApiKey() {
  return GOOGLE_MAPS_API_KEY;
}

export function loadGoogleMapsApi() {
  if (!GOOGLE_MAPS_API_KEY) {
    return Promise.reject(new Error("Google Maps API key is not configured."));
  }

  if (window.google?.maps) {
    return Promise.resolve(window.google.maps);
  }

  if (googleMapsPromise) {
    return googleMapsPromise;
  }

  googleMapsPromise = new Promise((resolve, reject) => {
    const existingScript = document.getElementById(SCRIPT_ID);
    if (existingScript) {
      existingScript.addEventListener("load", handleLoad, { once: true });
      existingScript.addEventListener("error", handleError, { once: true });
      return;
    }

    const callbackName = "__coffeeConnectGoogleMapsReady";
    const authFailureHandler = "gm_authFailure";
    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(GOOGLE_MAPS_API_KEY)}&libraries=marker&loading=async&v=weekly&callback=${callbackName}`;

    window[callbackName] = () => {
      cleanupHandlers();
      resolve(window.google.maps);
    };

    const previousAuthFailure = window[authFailureHandler];
    window[authFailureHandler] = () => {
      cleanupHandlers();
      googleMapsPromise = undefined;
      reject(new Error("Google Maps rejected the API key or the Maps JavaScript API is not enabled."));
      if (typeof previousAuthFailure === "function") {
        previousAuthFailure();
      }
    };

    script.addEventListener("error", handleError, { once: true });
    document.head.appendChild(script);

    function cleanupHandlers() {
      try {
        delete window[callbackName];
      } catch (error) {
        window[callbackName] = undefined;
      }

      if (previousAuthFailure) {
        window[authFailureHandler] = previousAuthFailure;
      } else {
        try {
          delete window[authFailureHandler];
        } catch (error) {
          window[authFailureHandler] = undefined;
        }
      }
    }

    function handleLoad() {
      if (window.google?.maps) {
        cleanupHandlers();
        resolve(window.google.maps);
      }
    }

    function handleError() {
      cleanupHandlers();
      googleMapsPromise = undefined;
      reject(new Error("Failed to load Google Maps JavaScript API."));
    }
  });

  return googleMapsPromise;
}
