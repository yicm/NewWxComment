# WxComment

`NewWxComment`[https://github.com/yicm/NewWxComment](https://github.com/yicm/NewWxComment)是一个微信小程序的评论组件，结合BaaS提供商[LeanCloud](https://leancloud.cn/)，无需其他另外的个人或者云服务器，就可以免费使用。解决了需要个人去注册域名、备案、购买云服务器的繁杂问题。且兼容`Valine`[https://github.com/xCss/Valine](https://github.com/xCss/Valine)评论，打通PC端和移动端评论，特别适合使用Valine评论系统且想同时开发小程序文章评论的同学们。


# 特色

- 独立插件，独立放入小程序项目即可使用
- 打通Valine评论系统，统一PC端和小程序端
- 友好的UI界面和交互界面
- 与微信用户信息绑定，显示微信用户头像和昵称
- 支持文章阅读量统计功能
- 支持评论回复功能，即子评论
- 支持emoji表情显示😉
- 支持评论分页加载
- 支持评论分页参数设置

# 屏幕截图

下图为`NewWxComment`嵌入式到具体博客中显示的效果。

TODO

# 快速入手

1. 注册LeanCloud账号，并创建过LeanCloud应用；

2. 登陆LeanCloud账号，打开链接[https://leancloud.cn/docs/weapp-domains.html](https://leancloud.cn/docs/weapp-domains.html)，将显示域名配置到你的微信小程序服务器配置中；

3. 设置小程序的 AppID 与 AppSecret
    3.1 登录 微信公众平台，在`设置` > `开发设置` 中获得 AppID 与 AppSecret
    3.2 前往 LeanCloud `控制台` > `组件` > `社交`，保存「微信小程序」的 AppID 与 AppSecret

4. 克隆Demo项目NewWxComment(Demo项目已附带NewWxComment组件)

```
$ git clone https://github.com/yicm/NewWxComment.git
```

5. 将LeanCloud自己的AppID和AppKey复制到NewWxComment.js对应位置；

```
AV.init({
    appId: 'your leancloud appid',
    appKey: 'your leancloud appkey',
});
```

6. 在小程序index.wxml和index.json文件中已经引入NewWxComment组件

index.wxml

```
<NewWxComment id="NewWxComment" articleTitle="关于我" articleURL="/2019/20190727172958.html" contentLen='1' articleID="/2019/20190727172958.html"></NewWxComment>
```

index.json

```
"usingComponents": {
    "NewWxComment": "/component/NewWxComment/NewWxComment"
}

```

NewWxComment组件属性说明：

```bash
articleTitle: 待评论页文章标题
articleURL: 待评论页文章链接(不包含网站域名)
homeURL: 小程序首页路径
pageSize: 评论每页加载条数，默认值5
contentMinLen: 评论最小长度要求，默认值2
contentMaxLen: 评论最大长度限制，默认值300
articleID: 待评论文章唯一ID
websiteURL: PC端网站域名(若无可不填)，默认值`https://xiaobaiai.net`
```

# Demo

小程序`小白AI`博客引用WxComment组件示例，评论消息订阅可见`我的`->`消息`：

![](https://raw.githubusercontent.com/yicm/WxComment/master/screenshot/xiaobaiai.jpg)

# TODO

- 支持点赞
- 支持作者回复
- 支持垃圾评论过滤
- ...

# License

[Mulan PSL v1](http://license.coscl.org.cn/MulanPSL)


