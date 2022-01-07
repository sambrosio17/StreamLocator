const puppeteer=require ('puppeteer');
var browser;
const PRIME = "https://www.primevideo.com/detail/"
const startService = async () => {
    browser= await puppeteer.launch({headless:true,userDataDir:'./cookieHandler', args:['--no-sandbox', '--disable-setuid-sandbox','--proxy-server=http://45.94.47.108:8152', `--ignore-certificate-errors`] });
    const pageIn= await browser.newPage();
    return pageIn;
}
const stealth= require('puppeteer-extra-plugin-stealth');

puppeteer.use(stealth());

const doSearch = async (keyword) => {
    const page=await startService();
    await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36");
    await page.authenticate({
        username:"zicntcra",
        password:"385kyaamrekj"
    });
    await page.goto("https://www.google.com/search?q="+keyword, { waitUntil: 'networkidle2', timeout:0 });
    return page;
}

const consentCookie = async (page) => {
    await page.$$eval(".QS5gu.sy4vM", el => el==null || el.length<1 ? console.log("nothing") : el[1].click());

}
const scrapeData = async (keyword, callback) => {
    console.log(keyword);
    var page= await doSearch(keyword);
    await page.screenshot({path:'test.jpg'});
    await consentCookie(page);
    //await page.setUserAgent("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.75 Safari/537.36");
    const browser= page.browser();
    //await page.waitForTimeout(1000);
    var title=await (await (await page.$(".SPZz6b span")).getProperty("innerText")).jsonValue();
    var containers=await page.$$(".w6bhBd");
    if(containers==null || containers.length<1){
        containers=await page.$$(".o0DLIc.w6bhBd");
        if(containers==null || containers.length<1)
            console.log("no res")
    }else {
        console.log("results are in: ");
    }
    var urls= await page.$$(".sATSHe a[ping]");
    //await console.log("url: "+ urls);
    var result= {
        title: title,
        providers:[]
    }
    //nome del servizio
//    await console.log( await (await (await containers[0].$(".ellip.bclEt")).getProperty("innerText")).jsonValue());
    //await containers[0].$eval(".ZkkK1e.yUTMj.k1U36b" ,(el) => el.click());
    //prime
//  await console.log(await page.url().slice(204).split("%")[0]); 
    for(var i=0; i<containers.length; i++){
        var provider={
            name: "",
            url: ""
        };
        provider.name = await (await (await containers[i].$(".ellip.bclEt")).getProperty("innerText")).jsonValue();
        provider.url= await (await urls[i+1].getProperty("href")).jsonValue();
        //await console.log(provider);
        await result.providers.push(provider);
    }
    data=result;
    print();
    browser.close();
    return await result;
}
var data=null;
const print = ()=> console.log(data);

module.exports = scrapeData;
