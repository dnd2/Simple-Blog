const path  = require( 'path' ),
      file  = require( 'fs' ),
      Evt   = require( 'events' ).EventEmitter,
      Fac   = require( './services/factory' ),
      log   = require( './log' ).logger( 'generator' );

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
        this.target = path.dirname( path.dirname( __filename ) ) + '/site/';
        this.inst   = Fac.getInstance(); 
        this.init(); 
    }

    init() {
        if ( ! file.existsSync( this.target ) ) { 
            file.mkdirSync( this.target );
        }

        this.process = {
            total: 0,    // 生成文件的总数
            step: 0,     // 当前完成文件数
            path: ''     // 当前执行文件路径
        };
        this.iPageNum = 0; // 首页总页数
        this.cateNum  = 0;    // 类目总页数
        this.articleNum = 0; // 总文章数
        this.total  = 0;      // 生成文件和目录的总数
        this.errNum = 0;

        this.pageSize = 15;
        // Add some event listeners
        evtEmitter.once( 'initProcess', () => {
            //this.createMain();
            /*this.createMain().then( ( val ) => {
                this.createCategories( val ).then( ( val ) => {
                    this.createArticles( val );
                });
            });*/
        }); 

        // Get the number of the records on default page
        Promise.all( [this.inst.article.getArticleNum(), 
                      this.inst.category.getCategoryNum()] ).then( ( vals ) => { 
            this.iPageNum   = Math.ceil( vals[0] / this.pageSize );
            this.cateNum    = vals[1];
            this.articleNum = vals[0];
            this.total      = vals[0] + this.iPageNum + this.articleNum;
            evtEmitter.emit( "initProcess" );  
        }).catch( ( err ) => {
            log.info( err );  
        });
    }

    /**
     * Method to create the default page on the blog. It will be 
     * build a list of latest articles from the template.
     * @public
     * @return {Promise}
     */
    createMain() {    
       return new Promise( ( resolve, reject ) => {
            let params = {
                   page: 1,
                   size: this.pageSize
                },
                excStack = [];

            for ( let i = 1; i <= this.iPageNum; i++ ) {
                params.page = i;
                excStack.push( this.inst.article.getArticles( params ) );
            }
           
            Promise.all( excStack ).then( ( vals ) => {
                let name = 'list-{1}.html';
                vals.forEach( ( value, index ) => {
                    if ( 1 == value.page ) {
                        name = 'index.html';
                    } else {
                        name = fileName.replace( /\{1\}/, value.page );
                    }

                    this.createFile( name, this.renderTpl( name, value ) );
                });

                resolve( 1 );
            });
       });  
    }
    /**
     * Method to create all the folders of the category. They will have all 
     * article html files in the specific category as well as a list of article
     * html files in the specific caregory.
     * 
     * 1. Create the category
     * 2. Create a list of the category
     * 3. Create the articles of the category
     */
    createCategories() {
        let categories;
        // Getting the root categories
        this.inst.category.getCategories().then( ( vals ) => {
             vals = JSON.parse( vals );
             let categories = {
                    items: vals,
                    len: vals.length || 0
                };

            /*for ( let i = 0; i < len; i++ ) {
                let cName = vals[i].name.replace( /\s+/, '_' );
                file.mkdirSync( this.target + cName );

            }*/

            function loopCategory( categories, id ) {
                let cVals = [];
                id = id || 0;

                for ( let i = 0; i < categories.len; i++ ) {
                    if ( id == categories.items[i].parent ) {
                        // console.log(111,JSON.stringify(categories.items[i].id));
                        // Check if there are some articles in the current directory, they will be created.
                        
                        loopCategory( categories, categories.items[i].id );
                    }
                }
            }

            loopCategory( categories );
        }).catch( ( err ) => {
            consol.log(err);  
        });

       
    }

    createArticles() {

    }

    renderTpl( tpl, data ) {
        return '' + data.page;
    }
    /**
     * Method to write the content of the rendered template into a file
     * @param {String} name 
     * @param {String} content 
     * @return {Boolean}
     */
    createFile( name, content ) {
        content = content || '';

        try {
            file.writeFileSync( this.target + name, content, 'utf-8' );
            this.process.step++;
            this.process.path = this.target + name;
        } catch ( e ) {
            log.info( e );
            this.errNum++;
            return false;
        }
        
        return true;
    }
    /**
     * Method to synchronize the data of file and database when user want to 
     * switch one to another.
     */
    syncData() {

    }
}

module.exports = Generator;