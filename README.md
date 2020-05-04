# 码上知道问答论坛(mszdqabbs)
一个仿知乎的问答论坛(A Q&A bbs which like Zhihu).

**[项目演示地址：http://mtk.pub/](http://mtk.pub/ "项目演示地址：http://mtk.pub/")**

# 项目预览图


------------


## PC端

[![文章详情页面](https://s1.ax1x.com/2020/04/30/Jbe8N4.png "文章详情页面")](http://mtk.pub/showArticle.html?articleId=34 "文章详情页面")

[![Markdown编辑页](https://s1.ax1x.com/2020/04/30/JbeYC9.png "Markdown编辑页")](http://mtk.pub/editor.html?type=writeArticle "Markdown编辑页")

[![“我的”](https://s1.ax1x.com/2020/04/30/Jbe3EF.png "“我的”")](http://mtk.pub/me.html "“我的”")

[![文章展示列表](https://s1.ax1x.com/2020/04/30/JbelHU.png "文章展示列表")](http://mtk.pub/article.html "文章展示列表")


------------


## 移动端


[![评论区](https://s1.ax1x.com/2020/04/30/Jbet3R.jpg "评论区")](http://mtk.pub/showArticle.html?articleId=33&target=comment "评论区")

[![“我的”](https://s1.ax1x.com/2020/04/30/JbeNg1.jpg "“我的”")](http://mtk.pub/me.html "“我的”")

[![文章展示列表](https://s1.ax1x.com/2020/04/30/JbeUjx.jpg "文章展示列表")](http://mtk.pub/article.html "文章展示列表")

## 项目简介

### 一个模仿知乎的问答论坛，以Markdown格式保存富文本，包含问答、文章、用户三大模块：
- **问答模块**

提问者可以登录到系统后，使用提问功能提出问题。问题提出后会显示在问题列表页，其他用户可以查看该问题，并进行回答、邀请回答、收藏问题、点赞等操作。

- **文章模块**

类似于个人博客，可以当做个人博客使用。用户登录后可以发表文章，对文章进行评论、收藏、点赞等操作。

- **用户模块**

使用JWT进行用户身份信息的保存和验证。用户注册时会收到一封验证邮件，验证通过后方可注册。
用户登录后，可以修改自己的头像、昵称、个性签名。在“我的”页面可以查看到个人信息以及发出的问题、回答、文章、评论、收藏，还有自己的粉丝和关注用户列表。

## 项目技术栈

- 数据库：MySQL 8.0
- 后端：SpringBoot + MyBatis + JWT + Tomcat
- 前端：Semantic UI + Editor.md + jQuery
- 项目构建和部署：Maven + Docker

## 如何部署

**你可以直接运行jar包，或者使用Docker进行部署。建议在Linux环境下部署。**
**无论使用哪种方式，你都需要自行建好数据库表，建表的SQL文件：*[qabbs.sql](https://github.com/jxzhangaoran/mszdqabbs/blob/master/qabbs.sql "qabbs.sql")***
### 直接运行jar包方式
需要环境：JDK版本在**13.0.2**以上、MySQL版本**8.0**
在Release里下载mszdqabbs-1.0.0.jar到本地，然后在控制台运行命令：

`nohup java -jar ./mszdqabbs-1.0.0.jar`

其中nohup代表在后台运行项目。如果你想调试项目，去掉nohup即可，日志会在控制台打印。

### 使用Docker进行部署

首先，你需要在自己的机器上安装好Docker。相关的教程可以自行搜索
安装好之后，在本地新建一个文件夹，并将[Dockerfile](https://github.com/jxzhangaoran/mszdqabbs/blob/master/Dockerfile "Dockerfile")和[mszdqabbs-1.0.0.jar](https://github.com/jxzhangaoran/mszdqabbs/releases/download/v1.0.0/mszdqabbs-1.0.0.jar "mszdqabbs-1.0.0.jar")文件放到该目录下。

使用`su`切换到root用户权限，方便之后操作。

依次运行如下命令：

```bash
docker build -t yourname/mszdqabbs .

docker run -d --network host -v mszdqabbs_files:/var yourname/mszdqabbs
```

解释一下，

`-d`表示在后台运行

`--network host`表示与宿主机共享网络，可以不用考虑端口映射的问题，虽然在安全性上有所损失。

`-v`表示使用volume存储镜像文件（容器重启后文件依然存在，数据不会丢失）。生产环境必须使用volume，以避免服务器重启、崩溃等导致的数据丢失。

### 数据库相关配置

由于项目使用了MySQL 8.0自带的ngram解析器，用来完成全局搜索的需求。
关于ngram的简介，在此不再赘述，可以点击下面的链接进行了解：

[关于ngram](https://www.yiibai.com/mysql/ngram-full-text-parser.html "关于ngram")

为了使ngram工作正常，需要对MySQL进行相关的配置，

请在**my.cnf**(Windows下为**my.ini**)配置文件里的**[mysqld]**项下面新增这两行：

`ngram_token_size=2`

`ft_min_word_len=2`

即可。若要查看配置是否成功，在重启MySQL服务之后运行如下命令：

```bash
show variables like 'ft_min_word_len';

show variables like 'ngram_min_token_size';
```

### 更新日志

#### 2020-05-03
     -修复了部分页面没有“邀请回答”链接的bug；
     -新增了基于SpringAOP的日志支持。

#### 2020-05-04
     -修复了“邀请回答”功能中关注用户头像显示错误的bug。
