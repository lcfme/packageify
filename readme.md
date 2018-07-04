# Packageify

# 使用方法

在projectrc.json 中声明全局可require的js，之后只要在html中引入
```html
<script src="/lib/js"></script>
```
，无论在任何js脚本，或者页面的script标签都可以使用require方法加载js。具体可见demo

# 处理文件规则

*.entry.js 通过browserify作为入口编译  
*.copy.* 复制文件到dist目录，不做任何其他处理
*.less lessc编译
*.html 通过html-img-loader 将 50k 以下的图片直接已base64的形式注入html
其他文件 复制文件到dist目录，不做任何其他处理