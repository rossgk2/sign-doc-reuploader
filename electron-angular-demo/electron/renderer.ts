async function initialize() {
    const information = document.getElementById("info");
    information.innerText = `This app is using Chrome (v${window.versions.chrome()}), Node.js (v${window.versions.node()}), and Electron (v${window.versions.electron()})`

    // const button = document.getElementById("button");
    // button.addEventListener("click", async function() {
    //     const documentId = document.getElementById("suffix-input").value;
    //     const url = `https://secure.na4.adobesign.com/document/cp/${documentId}/document.pdf`;
    //     const requestConfig = {
    //         method: "get",
    //         url: url,
    //         responseType: "arraybuffer"
    //         };

    //     /* preloader.js specifies that request2 should send requestConfig to the channel in the 
    //        main process named request1. In main.js it's specified that whenever the channel
    //        named request1 is invoked, the function handleRequest should be called on the provided
    //        requestConfig.

    //        Loosely speaking we have request2 -> request1 -> handleRequest.
    //     */
    //     const response = await window.api.request2(requestConfig);
    //     console.log(response);
    // });
}

document.addEventListener("DOMContentLoaded", initialize);

