const path  = require( 'path' ),
      file  = require( 'fs' ),
      Evt   = require( 'events' ).EventEmitter,
      Category = require( './category' ),
      Article  = require( './article' );

const evtEmitter = new Evt();      
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
            total: 0,    // 生成文件的总数
            step: 0,     // 当前完成文件数
        };

        this.pageSize = 15;
        // Add some event listeners
        evtEmitter.once( 'initProcess', ( data ) => {
            this.createMain( data ).then( ( val ) => {
                this.createCategories( val ).then( ( val ) => {
                    this.createArticles( val );
                });
            });
        }); 

        // Get the number of the records on default page
        Promise.all( [this.article.getArticleNum(), 
                      this.cate.getCategoryNum()] ).then( function( vals ) {
            let iSize  = Math.ceil( vals[0] / this.pageSize ); // 首页列表总页数

            evtEmitter.emit( "initProcess", {
                defaultNum: iSize,      // 首页总记录数
                cateNum: vals[1],       // 类目总记录数
                articleNum: vals[0],    // 总文章数
                total: vals[0] + iSize + cSize // 生成文件和目录的总数
            } );  
        });
    }

    /**
     * Method to create the default page on the blog. It will be 
     * build a list of latest articles from the template.
     * @public
     * @param params {Object}
     * @return {Promise}
     */
    createMain( params ) {
       // 1. 计算分页数 
       
       // 2. 获取每个列表页数据  
       
       //3. 生成文件       
       return new Promise( function( resovle, reject ) {

       });  
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