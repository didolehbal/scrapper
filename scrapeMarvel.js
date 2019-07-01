const request = require("request-promise")
const cheerio = require("cheerio")
const fs = require("fs")
const siteUrl = "http://www.marveltechgroup.com/"

download("../upload/201904/1554950686.jpg","1 blabla.jpg")

async function main(){
    //fetching cats 
    const cats = await fetchCategories()
    //making their dires
    cats.map(cat => {
        try {
        if(!fs.existsSync("products/"+cat.name))
            fs.mkdir("products/"+cat.name)
        } catch (error) {
            console.log(error)
        }
    })

    //fetching cat pages
    cats.map(async cat  => {
        //fetching pages of this cat
        const pages = await fetchCatPagesLinks(cat.link)
        // fetching all products of this cats (all pages)
        const products = await fetchcatProducts(pages)
        //making products dires in cat dire
        products.map(product => {
            try {
               let productDireName= "products/"+cat.name+"/"+product.name
                if(!fs.existsSync(productDireName))
                    fs.mkdir(productDireName)
                } catch (error) {
                    console.log(error)
                }
        })
        //downloading images in their dires
        products.map( async product =>{
            let productDireName= "products/"+cat.name+"/"+product.name
            let images = await productImagesLinks(product.link)
            images.map((image,i)=> {
                download(image.mini,productDireName+`/${i} mini.jpg`)
                download(image.big,productDireName+`/${i} big.jpg`)
            })
        })
    })
}



fetch = async (url = "") => {
    const result = await request(siteUrl+url);
    const $ = cheerio.load(result)
    return $
}


const fetchCategories = async () => {
    const $ = await fetch()
    let cats=[]
    $(".p_one a").each((i,el)=>{
        cats =[
            ...cats,
            {
                 name:$(el).text(),
                 link:$(el).attr("href")
            }
        ]
    })
    return cats
  };
 
  const fetchCatPagesLinks = async (cat_Link) => {
    const $ = await fetch(cat_Link)
    let nbPages = $(".met_pager").children("a").length
    if(nbPages>1) nbPages--;
    let paginatedLinks =[]
    for(i=1;i<=nbPages;i++){
        const pageLink = link.replace("-en",`-${i}-en`)
        paginatedLinks = [...paginatedLinks,pageLink]
    }
    return paginatedLinks
  };

  const fetchcatProducts = async (pages=[]) => {
    let products=[]
      pages.map( async link => {
            const $ = await fetch(link)
            $(".list_1 a")
            .each( async (i,el)=> {
                products =[...products,{
                name:$(el).children("h2").text().replace(":",""),
                link:$(el).attr("href")
                    }]
            })
      })
      return products
 }
const productImagesLinks = async (link) => {
        const $ = await fetch(link)
        let images=[]
        $(".items img").each((i,el)=> {
             images = [...images,{
                    mini:$(el).attr("src"),
                    big:$(el).attr("bimg")
                 }]

        })
        return images
}

/*

request(site, (error,response,html)=> {
        if(!error && response.statusCode === 200){
            const $ = cheerio.load(html)

          let products=[]
            $(".p_one a").each((i,el)=> {
                products =[
                    ...products,
                    {
                         name:$(el).text(),
                         link:$(el).attr("href")
                    }
                ]
            })
            products.map(({link,name}) => {
                request(site+link, async (error,response,html) => {
                    if(!error && response.statusCode === 200){
                        const $ = cheerio.load(html)
                        let nbPages = $(".met_pager").children("a").length
                        if(nbPages>1) nbPages--;
                        let paginatedLinks =[]
                        for(i=1;i<=nbPages;i++){
                            const pageLink = link.replace("-en",`-${i}-en`)
                            paginatedLinks = [...paginatedLinks,pageLink]
                        }
                        try {
                           await fs.mkdir("products/"+name,(err) => {
                            if (err) console.log(err)
                          })
                        } catch (error) {
                            console.log(error)
                        }
                        paginatedLinks.map(paginatedLink => {
                            request(site+paginatedLink, async (error,response,html) => {
                                if(!error && response.statusCode === 200){
                                    const $ = cheerio.load(html)
                                    $(".list_1 a").each( async (i,el)=>{
                                        const product = {
                                            name:$(el).children("h2").text().replace(":",""),
                                            link:$(el).attr("href")
                                        }
                                        const dirname="products/"+name+"/"+product.name
                                        try {
                                            await fs.mkdir(dirname,(err) => {
                                             if (err) console.log(err)
                                           })
                                         } catch (error) {
                                             console.log(error)
                                         }
                                         request(site+"product/"+product.link, async (error,response,html) => {
                                            if(!error && response.statusCode === 200){
                                                const $ = cheerio.load(html)
                                                $(".items img").each((i,el)=> {
                                                    const image ={
                                                        mini:$(el).attr("src"),
                                                        big:$(el).attr("bimg")
                                                    }
                                                    download(site+image.mini,dirname+`/${i} mini.jpg`,() => {
                                                        console.log("downloaded:"+image.mini)
                                                    })
                                                    download(site+image.big,dirname+`/${i} big.jpg`,() => {
                                                        console.log("downloaded:"+image.mini)
                                                    })
                                                })
                                            }
                                        })
                                         

                                    })
                                }
                            })
                        })

                    }
                })
            })

        }
})



  
*/
 function download(uri, filename){
    const optionsStart = {
        uri:siteUrl+"/product/"+uri,
        method: "GET",
        encoding: "binary",
        headers: {
          "Content-type": 'image/jpg'
        }
      };
     request(optionsStart).then((body,data)=> {
        let wr = fs.createWriteStream(filename)
        wr.write(body, 'binary');
        wr.on('finish', () => {
        console.log("downloaded: ",filename)
         });
         wr.end();
        }).catch(err => console.log(err));
  };