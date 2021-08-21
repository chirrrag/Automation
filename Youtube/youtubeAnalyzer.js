const puppeteer = require("puppeteer");
const PDFDocument = require('pdfkit');
const fs = require("fs");

let url = "https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq";

(async function fn() {
    try{
        let browserOpenP = puppeteer.launch({
            headless : false, 
            defaultViewport : null,
            args : ["--start-maximized", "--incognito"]
        });

        let browser = await browserOpenP;
        let allTabsArr = await browser.pages();
        cTab = allTabsArr[0];
        await cTab.goto(url);
        await cTab.waitForSelector("#title .style-scope.ytd-playlist-sidebar-primary-info-renderer a", {visible : true});
        await cTab.waitForSelector("#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer", {visible : true});

        let title = await cTab.evaluate(consoleTitle, "#title .style-scope.ytd-playlist-sidebar-primary-info-renderer a");
        console.log("Title ->" + title.trim());

        let playlistInfoObj = await cTab.evaluate(consoleInfo, "#stats .style-scope.ytd-playlist-sidebar-primary-info-renderer");
        console.log("Info is =>" + JSON.stringify(playlistInfoObj));

        console.log("title", title, "total videos", playlistInfoObj.videos, "total views", playlistInfoObj.views);

        let noOfSupposedVideos = playlistInfoObj.videos;

        let currentVideoLength = await getCurrentVideoLength();
        
        // console.log(currentVideoLength);
        while (noOfSupposedVideos - currentVideoLength >= 20) {
            // console.log(currentVideoLength);   
            await scrollToBottom();
            currentVideoLength = await getCurrentVideoLength();
        }


        let list = await getStats();
        // console.log(list);

        let pdfDoc = new PDFDocument;
        pdfDoc.pipe(fs.createWriteStream('VideoDetails.pdf'));

        list = JSON.stringify(list);
        pdfDoc.text(list);
        pdfDoc.end();
    }
    catch(err) {
        console.log(err);
    }
})();


function consoleTitle(selector) {
    let title = document.querySelector(selector);
    title = title.innerText;
    return title;
}

function consoleInfo(selector) {
    let allElem = document.querySelectorAll(selector);
    let videos = allElem[0].innerText;
    let views = allElem[1].innerText;
    videos = videos.split(" ")[0];
    views = views.split(" ")[0];

    return {videos, views};
}

async function getCurrentVideoLength() {
    await cTab.waitForSelector("#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer");
    let length = await cTab.evaluate(consoleGetLength, "#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer");
    return length;

}

function consoleGetLength(durationSelector) {
    let durationElem = document.querySelectorAll(durationSelector);
    return durationElem.length;
}

async function scrollToBottom() {
    await cTab.evaluate(goToBottom);
    function goToBottom() {
        window.scrollBy(0, window.innerHeight);
    }
}

async function getStats() {
    let list = await cTab.evaluate(consoleGetNameAndTime, "#video-title", "#container>#thumbnail span.style-scope.ytd-thumbnail-overlay-time-status-renderer");
    return list;
}

function consoleGetNameAndTime(titleSelector, durationSelector) {
    let allElemName = document.querySelectorAll(titleSelector);
    let allDuration = document.querySelectorAll(durationSelector);

    let currentVideoList = [];

    for(let i = 0; i < allDuration.length; i++) {
        let videoTitle = allElemName[i].innerText;
        let duration = allDuration[i].innerText;
        
        currentVideoList.push(
            {
                videoTitle, duration
            }
        );
    }
    return currentVideoList;
}

// title ==>   #title .style-scope.ytd-playlist-sidebar-primary-info-renderer
// info ==> #stats .style-scope.ytd-playlist-sidebar-primary-info-renderer