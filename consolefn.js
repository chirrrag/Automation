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