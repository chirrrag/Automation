const puppeteer = require("puppeteer");
const fs = require("fs");
const PDFDocument = require('pdfkit');

let pdfDoc = new PDFDocument;
// pdfDoc.pipe(fs.createWriteStream('SampleDocument.pdf'));
// pdfDoc.text("My Sample PDF Document");
// pdfDoc.end();

let links = ["https://www.amazon.in", "https://www.flipkart.com", "https://paytmmall.com"];
let cTab;

let pName = process.argv[2];

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

        let amazonList = await getListingFromAmazon(links[0], pName);
        // console.table(amazonList);
        
        pdfDoc.pipe(fs.createWriteStream('AmazonProducts.pdf'));
        amazonList = JSON.stringify(amazonList);
        pdfDoc.text(amazonList);
        pdfDoc.end();
        
        let fKartList = await getListingFromFlipkart(links[1], pName);
        // console.table(fKartList);
        pdfDoc = new PDFDocument;
        pdfDoc.pipe(fs.createWriteStream('FkartProducts.pdf'));
        fKartList = JSON.stringify(fKartList);
        pdfDoc.text(fKartList);
        pdfDoc.end();

        let paytmList = await getListingFromPaytm(links[2], pName);
        // console.table(paytmList);
        pdfDoc = new PDFDocument;
        pdfDoc.pipe(fs.createWriteStream('PaytmProducts.pdf'));
        paytmList = JSON.stringify(paytmList);
        pdfDoc.text(paytmList);
        pdfDoc.end();
    }
    catch(err) {
        console.log(err);
    }
})();


async function getListingFromAmazon(link, pName) {
    await cTab.goto(link);
    console.log("reached amazon home page");
    // await cTab.waitForSelector("#twotabsearchtextbox", {visible : true});
    // await cTab.click("#twotabsearchtextbox");
    await waitAndClick("#twotabsearchtextbox");
    console.log("search bar activated");
    await cTab.type("#twotabsearchtextbox", pName, { delay: 10 });
    console.log("typing successful");
    await waitAndClick("#nav-search-submit-button");
    console.log("moved to product page");

    await cTab.waitForSelector(".s-expand-height.s-include-content-margin.s-latency-cf-section.s-border-bottom", {visible : true});
    // .a-size-medium.a-color-base.a-text-normal
    // .s-expand-height.s-include-content-margin.s-latency-cf-section.s-border-bottom
    // ".s-include-content-margin.s-border-bottom.s-latency-cf-section",
        // ".aok-inline-block.s-sponsored-label-info-icon",
    // .a-size-mini.a-spacing-none.a-color-base.s-line-clamp-2
    // .a-price-whole

    let lists = cTab.evaluate(amazonConsoleFn, ".s-expand-height.s-include-content-margin.s-latency-cf-section.s-border-bottom",
     ".aok-inline-block.s-sponsored-label-info-icon",
      ".a-size-mini.a-spacing-none.a-color-base.s-line-clamp-2",
       ".a-price-whole");
    return lists;

}

async function getListingFromFlipkart(link, pName) {

    await cTab.goto(link);
    console.log("reached fkart page");
    await waitAndClick("._2KpZ6l._2doB4z");
    await waitAndClick("._3704LK");
    console.log("search bar activated");
    await cTab.type("._3704LK", pName, { delay: 10 });
    console.log("typing successful");
    await waitAndClick(".L0Z3Pu");
    console.log("searched");

    // _2kHMtA
    // _4rR01T
    // ._30jeq3._1_WHN1
    await cTab.waitForSelector("._4rR01T", {visible : true});
    let list = cTab.evaluate(fkartConsoleFn, "._4rR01T", "._30jeq3");
    return list;
}

async function getListingFromPaytm(link, pName) {
    await cTab.goto(link);
    await waitAndClick("input[type='search']");
    await cTab.type("input[type='search']", pName, {delay : 200});
    // await cTab.keyboard.press('Accept');
    await cTab.keyboard.press('Enter');
    // .UGUy -> product name
    // ._1kMS -> price
    // __________________________________________________________________
    // do wait for the price and name selector
    // ---------------------------------------------------------------------
    await cTab.waitForSelector(".UGUy", { visible: true });
    await cTab.waitForSelector("._1kMS", { visible: true });
    let list = cTab.evaluate(fkartConsoleFn, ".UGUy", "._1kMS");
    return list;
    

}

async function waitAndClick(selector) {
    try{
        await cTab.waitForSelector(selector, {visible : true});
        await cTab.click(selector);
    }
    catch(err) {
        console.log("err is -> " + err);
    }
}

function amazonConsoleFn(blockSelector, sponsoredIdentifier, nameSelector, priceSelector) {
    let allBlocks = document.querySelectorAll(blockSelector);
    let list = [];
    for (let i = 0; i < allBlocks.length; i++) {
        let isSponsored = allBlocks[i].querySelector(sponsoredIdentifier);
        if (isSponsored == null) {
            let nameElem = allBlocks[i].querySelector(nameSelector);
            let priceElem = allBlocks[i].querySelector(priceSelector);
            list.push({
                name: nameElem.innerText,
                price: priceElem.innerText
            }
            )
        }
        if (list.length == 5) {
            return list;
        }
    }
    return list;
}

function fkartConsoleFn(nameSelector, priceSelector) {
    let nameElems = document.querySelectorAll(nameSelector);
    let priceElems = document.querySelectorAll(priceSelector);
    console.log("name -> " + nameElems.length);
    console.log("price -> " + priceElems.length);
    let list = [];
    for(let i = 0; i < 5; i++) {
        // let name = nameElems[i].innerText;
        list.push({
            name : nameElems[i].innerText,
            price : priceElems[i].innerText
        });
    }
    return list;
}