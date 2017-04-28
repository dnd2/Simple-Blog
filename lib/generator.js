const path  = require( 'path' ),
      file  = require( 'fs' ),
      Category = require( './category' ),
      Article  = require( './article' );
/**
 * This class provides some methods on generating the html file and
 * pushing the html file to git respository.
 * 
 * @Author Michael
 * @Date 2017.04.15
 * @Version 1.0.0
 */
class Generator {
    constructor() {
        // 生成文件的目录路径
        this.target  = path.dirname( path.dirname( __filename ) ) + '/site/';
        this.cate    = new Category();
        this.article = new Article();
        init();
    }

    init() {
        if ( ! file.existsSync( this.path ) ) {
            file.mkdirSync( this.path );
        }

        this.process = {
            total: 0,     // 生成文件的总数
            step: 0, // 当前完成文件数
        };
        this.defaultNum = 0; // 首页总记录数
        this.cateNum = 0; // 类目总记录数
        this.articleNum = 0; // 总文章数
        this.pageSize = 15;

        // Get the number of the records on default page
        Promise.all( [this.article.getArticleNum(), 
                      this.cate.getCategoryNum()] ).then( function( vals ) {
            let iSize = Math.ceil( vals[0] / this.pageSize );
            let cSize = vals[1];
            
        });
    }

    /**
     * Method to create the default page on the blog. It will be 
     * build a list of latest articles from the template.
     */
    createMain() {
       // 1. 计算分页数 
       
       // 2. 获取每个列表页数据  
       
       //3. 生成文件         
    }
    /**
     * Method to create all the folders of the category. They will have all 
     * article html files in the specific category as well as a list of article
     * html files in the specific caregory.
     */
    createCategories() {

    }

    createArticles() {

    }
    /**
     * Method to synchronize the data of file and database when user want to 
     * switch one to another.
     */
    syncData() {

    }
}