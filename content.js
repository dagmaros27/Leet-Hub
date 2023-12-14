let lines = [];
let shas = {};
let problemTitle = null;
let langUsed = null;
const username = "dagmaros27";
const password = "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";

const headers = new Headers({
  Authorization: "Basic " + btoa(username + ":" + password),
});

/*
  to push a certain file to github repo there are five steps
  1. get the latest commit sha hash
  2. by using the the latest commit sha hash we  get the base tree
  3. then post the file to github repo
  4. commit the file change
  5. add the comit sha hash to the main branch

*/

async function getLatestSha() {
  const url =
    "https://api.github.com/repos/dagmaros27/Comptetive-programming/git/refs/heads/main";

  await fetch(url, {
    method: "GET",
    headers: headers,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Network response was not ok");
      }
    })
    .then((data) => {
      shas.shaLatestTree = data?.object.sha;
      getBaseTree(data?.object.sha);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function getBaseTree(latestSha) {
  const url =
    "https://api.github.com/repos/dagmaros27/Comptetive-programming/git/commits/" +
    latestSha;

  fetch(url, {
    method: "GET",
    headers: headers,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Network response was not ok");
      }
    })
    .then((data) => {
      fileContent = solutionExtractor();

      postFile(data?.sha, problemTitle, fileContent, langUsed);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function postFile(baseTree, fileName, fileContent, fileType) {
  const url =
    "https://api.github.com/repos/dagmaros27/Comptetive-programming/git/trees";

  const requestBody = {
    base_tree: baseTree,
    tree: [
      {
        path: fileName + fileType,
        mode: "100644",
        type: "blob",
        content: fileContent,
      },
    ],
  };

  const requestBodyString = JSON.stringify(requestBody);
  fetch(url, {
    method: "POST",
    headers: headers,
    body: requestBodyString,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Network response was not ok");
      }
    })
    .then((data) => {
      postCommit(shas.shaLatestTree, data?.sha, problemTitle);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function postCommit(latestSha, newtree, fileName) {
  const url =
    "https://api.github.com/repos/dagmaros27/Comptetive-programming/git/commits";

  const requestBody = {
    parents: [latestSha],
    tree: newtree,
    message: fileName,
  };

  const requestBodyString = JSON.stringify(requestBody);
  fetch(url, {
    method: "POST",
    headers: headers,
    body: requestBodyString,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Network response was not ok");
      }
    })
    .then((data) => {
      pushCommit(data?.sha);
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

function pushCommit(newCommit) {
  const url =
    "https://api.github.com/repos/dagmaros27/Comptetive-programming/git/refs/heads/main";

  const requestBody = {
    sha: newCommit,
  };

  const requestBodyString = JSON.stringify(requestBody);
  fetch(url, {
    method: "POST",
    headers: headers,
    body: requestBodyString,
  })
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error("Network response was not ok");
      }
    })
    .catch((error) => {
      console.error("Fetch error:", error);
    });
}

// extract the solution from the leetcode page
function solutionExtractor() {
  lines = []; // this clears the lines when it extracts multiple time
  const editor = document.querySelector(".view-lines");
  const editorChildren = editor.children;
  for (let i = 0; i < editorChildren.length; i++) {
    const child = editorChildren[i];
    lines.push(child.textContent);
  }
  const linesString = lines.join("\n");
  return linesString;
}

//to download the solution as a file in the downloads directory
function solutionSaver(name, type) {
  let linesString = solutionExtractor();
  const blob = new Blob([linesString], { type: "text/plain" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = name + type;
  a.dispatchEvent(new MouseEvent("click"));
  URL.revokeObjectURL(a.href);
}

//message passer from popup.js to background to ignite a certain action
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "save") {
    problemTitle = request.title;
    langUsed = request.lang;
    getLatestSha()
      .then(() => {
        sendResponse({ message: "solution saved successfully" });
      })
      .catch((error) => {
        sendResponse({ message: "error has occured, try again" });
      });
  } else if (request.action === "download") {
    solutionSaver(request.title, request.lang);
    sendResponse({ message: "solution downloaded successfully" });
  }
});
