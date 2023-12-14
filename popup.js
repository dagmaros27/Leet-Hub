const title = document.querySelector("p");
const button1 = document.getElementById("saveButton");
const button2 = document.getElementById("downloadButton");
const wrapper = document.getElementById("wrapper");
const onleetcode = document.getElementById("onLeetcode");
const authButton = document.getElementById("githubAuthorize");
const lang = document.getElementById("lang");
const bgp = chrome.extension.getBackgroundPage();
let url = "";

// Function to send a message to the active tab
async function sendMessageToActiveTab(action, lang) {
  const [tab] = await chrome.tabs.query({
    active: true,
    lastFocusedWindow: true,
  });

  if (tab) {
    button1.disabled = true;
    const response = await chrome.tabs.sendMessage(tab.id, {
      action: action,
      title: titleExtractor(title.textContent),
      lang: lang,
    });

    if (response) {
      console.log("response: ", response);
      wrapper.appendChild(addMessage(response.message));
    }
  } else {
    console.error("No active tab found");
  }
}

function addMessage(message) {
  let shower = document.createElement("div");

  shower.classList.add("message");
  shower.textContent = message;
  return shower;
}

// listener to commit the solution to GitHub
button1.addEventListener("click", () => {
  console.log(lang.value);
  let langUsed = "." + lang.value;
  sendMessageToActiveTab("save", langUsed);
});

// listener to download the solution
button2.addEventListener("click", () => {
  console.log(lang.value);
  let langUsed = "." + lang.value;
  sendMessageToActiveTab("download", langUsed);
});

authButton.addEventListener("click", function () {
  chrome.identity.launchWebAuthFlow({
    url: "https://github.com/login/oauth/authorize?client_id=e120641b535aa3221f80&scope=repo",
    interactive: true,
  });
});

// extract the URL of the LeetCode problem and display it on the popup
getCurrentTab().then((tab) => {
  if (tab) {
    let github_token = localStorage.getItem("github_token");
    if (github_token) {
      url = tab.url;
      title.textContent = `Problem link: ${url}`;
      onleetcode.style.display = "block";
    } else {
      onleetcode.style.display = "none";
      authButton.style.display = "block";
    }
  } else {
    onleetcode.style.display = "none";
    title.textContent = "This page doesn't have a LeetCode problem";
  }
});

// extract the title from the URL for further use in the background
function titleExtractor(url) {
  const parts = url.split("/");
  for (let i = parts.length - 1; i >= 0; i--) {
    if (parts[i] === "problems") {
      return parts[i + 1];
    }
  }
  return "file";
}

// activate the extension and return the active tab on the browser if the URL matches a LeetCode problem
async function getCurrentTab() {
  let queryOptions = {
    url: "https://leetcode.com/problems/*",
    active: true,
    lastFocusedWindow: true,
  };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}
