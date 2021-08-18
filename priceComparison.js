const puppeteer = require("puppeteer");

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

        let list = await getListingFromAmazon(links[0], pName);
        console.table(list);
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

    let lists = cTab.evaluate(consoleFn, ".s-expand-height.s-include-content-margin.s-latency-cf-section.s-border-bottom",
     ".aok-inline-block.s-sponsored-label-info-icon",
      ".a-size-mini.a-spacing-none.a-color-base.s-line-clamp-2",
       ".a-price-whole");
    return lists;

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

function consoleFn(blockSelector, sponsoredIdentifier, nameSelector, priceSelector) {
    // let nameElems = document.querySelectorAll(nameSelector);
    // let priceElems = document.querySelectorAll(priceSelector);

    // let listings = [];
    // // here we will put price and name of the product in object form in an Array
    // for(let i = 0; i < 5; i++) {
    //     let name = nameElems[i].innerText;
    //     let price = priceElems[i].innerText;
    //     listings.push({
    //         name, price
    //     });
    // }
    // return listings;



    // let allBlocks = document.querySelectorAll(blockSelector);
    // let list = [];
    // for(let i = 0; i < allBlocks.length; i++) {
    //     let isSponsored = allBlocks[i].querySelectorAll(sponsorSelector);
    //     if(isSponsored == null) {
    //         let nameElems = allBlocks[i].querySelectorAll(nameSelector);
    //         let priceElems = allBlocks[i].querySelectorAll(priceSelector);
// #################################################################################3
// here i have to do query selector only instead of query slector all.....
// #####################################################################################
    //         list.push({
    //             name : nameElems.innerText,
    //             price : priceElems.innerText
    //         });
    //     }

    //     if(list.length == 5) {
    //         return list;
    //     }
    // }
    // return list;
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