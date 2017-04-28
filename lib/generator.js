const path = require( 'path' ),
      file = require( 'fs' );
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
        init();
    }

    init() {
        if ( ! file.existsSync( this.path ) ) {
            file.mkdirSync( this.path );
        }

        this.process = {
            step: 0,
            total: 100,
            files: 0,     // 生成文件的总数
            curProcess: 0 // 当前完成文件数
        };
        
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