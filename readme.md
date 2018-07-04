# Packageify

# 使用方法

在projectrc.json 中声明全局可require的js，之后只要在html中引入
```html
<script src="/lib/js"></script>
```
,无论在任何js脚本，或者页面的script标签都可以使用require方法加载js。具体可见demo

# 处理文件规则

*.entry.js 通过browserify作为入口编译  
*.copy.* 复制文件到dist目录，不做任何其他处理
*.less lessc编译
*.html 通过html-img-loader 将 50k 以下的图片直接已base64的形式注入html
其他文件 复制文件到dist目录，不做任何其他处理

注意 如*.entry.js的修饰符entry会被删除，html中引用时请引用*.js  

browserify -r dep1 -r dep2 表示把dep1和dep2打到一个包里，如果dep1是node_modules，可以通过require('dep1')直接引用。如果dep1是普通的module如./path/to/you/file,则需要用./path/to/you/file:file，冒号后的file表记模块名，之后require('file')就可以引用到。（具体参见demo）

# 警告
为了保护lib目录，任何在projectrc.browserify.libDir定义下的文件只能在lib中配置引用。js文件遍历忽略这部分文件。

