// // Function to handle the redirect URL
// function handleRedirect(details) {
//   console.log("Callback URL:", details.url);

//   const authorizationCode = extractAuthorizationCodeFromRedirectUrl(
//     details.url
//   );
//   console.log(authorizationCode);

//   // ... your code to exchange the code for an access token ...
// }

// // Function to extract the authorization code from the redirect URL
// function extractAuthorizationCodeFromRedirectUrl(redirectUrl) {
//   // Parse the URL and extract the code parameter
//   const url = new URL(redirectUrl);
//   return url.searchParams.get("code");
// }

// chrome.webNavigation.onCompleted.addListener(handleRedirect);
// console.log("WebNavigation listener set up");

chrome.webNavigation.onCompleted.addListener(function (details) {
  console.log("WebNavigation completed:", details);

  if (
    details.url.startsWith(
      "chrome-extension://gfllcehecdkgbgabgdjflegcjejolngi/path/to/callback"
    )
  ) {
    console.log("Callback URL received:", details.url);
    // ... your existing code ...
  }
});
