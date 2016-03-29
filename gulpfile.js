var env = require('./env');
var isDev = env == "dev";
var config = require('./gulpfile.config');

var gulp = require('gulp'),
	less = require("gulp-less"),									//less to css
	lessAutoprefixer = require('less-plugin-autoprefix'),			//less插件··自动化前缀
	csso = require("gulp-csso"),									//压缩 css
	uglify = require("gulp-uglify"),								//混淆压缩JS代码
	jshint = require('gulp-jshint'),								//JS语法检查
	imagemin = require('gulp-imagemin'),							//图片压缩
	pngquant = require('imagemin-pngquant'),						//图片深度亚搜
	concat = require("gulp-concat"),								//合并文件
	gulpIf = require('gulp-if'),									//根据条件执行命令
	sequence = require('gulp-sequence'),							//执行order
	rev = require("gulp-rev"),										//给静态文件加上版本号
	revCollector = require('gulp-rev-collector'),					//静态文件加上版本号之后该同步的地方就同步
	clean = require("gulp-clean"),									//清空文件夹
	stripDebug = require('gulp-strip-debug'),						//打包的时候，删除console.log代码
	preprocess = require('gulp-preprocess'),						//文本预处理器
	watch = require('gulp-watch'),									//监听文件变化
	connect = require('gulp-connect'),								//本地服务器
	seajsCombo = require( 'gulp-seajs-combo' );

var libsDest = config['dest'][env]['libs'],
	libsJsSrc = config['src']['libsJs'],
	libsLessSrc = config['src']['libsLess'],
	libsImgSrc = config['src']['libsImg'];
var pagesDest = config['dest'][env]['pages'],
	pagesJsSrc = config['src']['pagesJs'],
	pagesLessSrc = config['src']['pagesLess'],
	pagesImgSrc = config['src']['pagesImg'],
	pagesHtmlSrc = config['src']['pagesHtml'];

/*
 * @libs 公用内容打包
 */
//清楚旧文件
gulp.task("clean:libs", function(){
	return gulp.src([libsDest], {read:false})
		.pipe(clean({force: true}));
});

//脚本文件处理
gulp.task("release:libs:js", function(){
	return gulp.src(libsJsSrc)
		.pipe(concat('libs.js'))
		.pipe(jshint())
		.pipe(gulpIf(!isDev, stripDebug()))
		.pipe(gulpIf(!isDev, uglify()))
		.pipe(gulpIf(!isDev, rev()))
		.pipe(gulp.dest(libsDest))
		.pipe(gulpIf(!isDev, rev.manifest()))
		.pipe(gulpIf(!isDev, gulp.dest(libsDest + "js-rev/")));
});

//样式文件处理
gulp.task("release:libs:style", function(){
	return gulp.src(libsLessSrc)
		.pipe(less({
			plugins: [
				new lessAutoprefixer({
					browsers: ['last 2 versions'],
                    cascade: true, //是否美化属性值 默认：true
                    remove: true //是否去掉不必要的前缀 默认：true 
				})
			]
		}))
		.pipe(concat('libs.css'))
		.pipe(csso(true))
		.pipe(gulpIf(!isDev, rev()))
		.pipe(gulp.dest(libsDest))
		.pipe(gulpIf(!isDev, rev.manifest()))
		.pipe(gulpIf(!isDev, gulp.dest(libsDest + "css-rev/")));
});

//图片文件处理
gulp.task("release:libs:images", function(){
	if(isDev){
		return gulp.src(libsImgSrc)
			.pipe(gulp.dest(libsDest + "images/"));	
	}else{
		return gulp.src(libsImgSrc)
            .pipe(imagemin({
                optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
                svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
                use: [pngquant()], //使用pngquant深度压缩png图片的imagemin插件
                progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
                interlaced: true//类型：Boolean 默认：false 隔行扫描gif进行渲染
            }))
            .pipe(rev())
            .pipe(gulp.dest(libsDest + "images/"))
            .pipe(rev.manifest())
            .pipe(gulp.dest(libsDest + '/images-rev/'));
	}
});

/*
 * @libs 运行任务task
 */
gulp.task("release:libs", function(callback){
	sequence('clean:libs', ['release:libs:style', 'release:libs:js', 'release:libs:images'], callback);
});


/*
 * @pages 页面内容打包
 */
//清楚旧文件
gulp.task("clean:pages", function(){
	return gulp.src([pagesDest], {read:false})
		.pipe(clean({force: true}));
});

//样式文件处理
gulp.task("release:pages:style", function(){
	return gulp.src(pagesLessSrc)
		.pipe(less({
			plugins: [
				new lessAutoprefixer({
					browsers: ['last 2 versions'],
                    cascade: true, //是否美化属性值 默认：true
                    remove: true //是否去掉不必要的前缀 默认：true 
				})
			]
		}))
		.pipe(csso(true))
		.pipe(gulpIf(!isDev, rev()))
		.pipe(gulp.dest(pagesDest))
		.pipe(gulpIf(!isDev, rev.manifest()))
		.pipe(gulpIf(!isDev, gulp.dest(pagesDest + "css-rev/")));
});

//脚本文件处理
gulp.task("release:pages:js", function(){
	return gulp.src(pagesJsSrc)
		.pipe(seajsCombo())
		.pipe(jshint())
		.pipe(gulpIf(!isDev, stripDebug()))
		.pipe(gulpIf(!isDev, uglify()))
		.pipe(gulpIf(!isDev, rev()))
		.pipe(gulp.dest(pagesDest))
		.pipe(gulpIf(!isDev, rev.manifest()))
		.pipe(gulpIf(!isDev, gulp.dest(pagesDest + "js-rev/")));
});

//图片文件处理
gulp.task("release:pages:images", function(){
	if(isDev){
		return gulp.src(pagesImgSrc)
			.pipe(gulp.dest(pagesDest));	
	}else{
		return gulp.src(pagesImgSrc)
			.pipe(imagemin({
                optimizationLevel: 5, //类型：Number  默认：3  取值范围：0-7（优化等级）
                svgoPlugins: [{removeViewBox: false}],//不要移除svg的viewbox属性
                use: [pngquant()], //使用pngquant深度压缩png图片的imagemin插件
                progressive: true, //类型：Boolean 默认：false 无损压缩jpg图片
                interlaced: true//类型：Boolean 默认：false 隔行扫描gif进行渲染
            }))
            .pipe(rev())
            .pipe(gulp.dest(pagesDest + "images/"))
            .pipe(rev.manifest())
            .pipe(gulp.dest(pagesDest + '/images-rev/'));
	}
});

//HTML文件处理
gulp.task("release:pages:html", function(){
	return gulp.src(pagesHtmlSrc)
		.pipe(preprocess())
		.pipe(gulp.dest(pagesDest));
});

//版本号替换
gulp.task("release:rev", function(){});

/*
 * @pages 运行任务task
 */
gulp.task("release:pages", function(callback){
	sequence('clean:pages', ['release:pages:style', 'release:pages:js', 'release:pages:images', 'release:pages:html'], 'release:rev', callback);
});


/*
 * @watch 任务task运营
 * @dev 开发时debug
 */
gulp.task("watch", function(callback){
	watch(pagesLessSrc, function(){
		gulp.start('release:pages:style');
	});
	watch(pagesJsSrc, function(){
		gulp.start('release:pages:js');
	});
	watch(pagesImgSrc, function(){
		gulp.start('release:pages:images');
	});
	watch(pagesHtmlSrc, function(){
		gulp.start('release:pages:html');
	});
});
gulp.task("webserver", function(){
	connect.server({
        livereload: true,
        livereload: {
            port: config.port
        },
        port: config.port
    });
});
gulp.task("dev", ["webserver", "watch"]);

