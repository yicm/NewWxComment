/*
Copyright (c) [2019] [Ethan(yicm1102@gmail.com)]
[NewWxComment] is licensed under the Mulan PSL v1.
You can use this software according to the terms and conditions of the Mulan PSL v1.
You may obtain a copy of Mulan PSL v1 at:
    http://license.coscl.org.cn/MulanPSL
THIS SOFTWARE IS PROVIDED ON AN "AS IS" BASIS, WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO NON-INFRINGEMENT, MERCHANTABILITY OR FIT FOR A PARTICULAR
PURPOSE.
See the Mulan PSL v1 for more details.

And more:
  author: yicm1102@gmail.com
  github: https://github.com/yicm/NewWxComment
  website: https://xiaobaiai.net
  sync valine version: 1.3.6
  leanstorage javascript api: https://leancloud.cn/docs/leanstorage_guide-js.html
*/
const AV = require('../../libs/leancloud/av-weapp-min.js');
var Common = require('../../libs/scripts/common.js');
// LeanCloud 应用的 ID 和 Key

AV.init({
    appId: 'your leancloud app id',
    appKey: 'your leancloud app key',
});

Component({
    /**
     * 组件的属性列表
     */
    properties: {
        articleTitle: {
            type: String,
            value: ''
        },
        articleURL: {
            type: String,
            value: ''
        },
        homeURL: {
            type: String,
            value: '../index/index'
        },
        pageSize: {
            type: Number,
            value: 5
        },
        theme: {
            type: String,
            value: 'light' // light & dark
        },
        contentMinLen: {
            // 评论内容至少为多长限制
            type: Number,
            value: 2
        },
        contentMaxLen: {
            type: Number,
            value: 300
        },
        copyRight: {
            type: String,
            value: '©2019 小白AI.易名 xiaobaiai.net'
        },
        articleID: {
            type: String,
            value: '',
            observer: function (newVal, oldVal) {
                let that = this;
                console.log(that.data.articleID);
                console.log(newVal);
                // 在组件实例进入页面节点树时执行
                // this.data生效
                // 获取总评论数
                this._leanQuery('total');
                // 获取点赞数
                // TODO

                if (this.data.theme == 'dark') {
                    this.setData({
                        isDark: true
                    })
                } else {
                    this.setData({
                        isDark: false
                    })
                }
                this.fetechPCommentNum();
            }
        },
        websiteURL: {
            type: String,
            value: 'https://xiaobaiai.net'
        }
    },

    /**
     * 组件的初始数据
     */
    data: {
        // 主题
        isDark: false,
        // 系统相关
        uaInfo: '',
        // 授权相关
        showAurButton: false,
        isMenuboxShow: false,
        isMenuboxLoad: true,
        enableComment: true,
        menuBackgroup: false,
        isLoginPopup: false,
        userInfo: {},
        // 评论相关
        commentTabName: 'Comment',
        counterTabName: 'Counter',
        placeholder: '评论...',
        display: 'block',
        commentPNum: 0,
        commentCount: 0,
        likeCount: 0,
        commentCountStr: '',
        commentIndex: 1,
        isLastPage: false,
        isLoading: false,
        isFocusing: false,
        commentsRawList: [],
        commentsList: [],
        content: '',
        toCommentPid: undefined,
        toCommentRid: undefined
    },

    /**
     * 组件生命周期函数
     */
    lifetimes: {
        created: function () {
            // 组件实例刚刚被创建时
            console.log("created");
        },
        attached: function () {
            this.getUAInfo();
        },
        ready: function () {
            // 在组件在视图层布局完成后执行
            console.log("ready");
        },
        detached: function () {
            // 在组件实例被从页面节点树移除时执行
            console.log("detached");
        },
    },
    /**
     * 组件的方法列表
     */
    methods: {
        showHideMenu: function (e) {
            this.setData({
                showAurButton: false,
                isMenuboxShow: !this.data.isMenuboxShow,
                isMenuboxLoad: false,
                menuBackgroup: this.data.isMenuboxShow
            })
        },
        // 点击非评论区隐藏功能菜单
        hiddenMenubox: function () {
            console.log("hiddenMenubox");
            this.setData({
                isMenuboxShow: false,
                menuBackgroup: false
            })
        },
        goHome: function () {
            var that = this;
            wx.switchTab({
                url: that.data.homeURL
            })
        },
        onCreatePoster: function () {
            wx.showToast({
                title: '敬请期待',
                icon: 'none',
                duration: 2000
            });
        },
        clickLike: function () {
            wx.showToast({
                title: '敬请期待',
                icon: 'none',
                duration: 2000
            });
        },
        aboutWxComment: function () {
            let that = this;
            wx.showModal({
                title: '关于',
                content: that.data.websiteURL,
                showCancel: false,
                confirmText: '记住了',
                success(res) {
                    // nothing to do
                }
            })
        },
        praise: function () {
            this.showHideMenu();
            var self = this;
            var minAppType = config.getMinAppType;
            var system = self.data.system;
            if (minAppType == "0" && system == 'Android') {
                if (self.data.openid) {
                    wx.navigateTo({
                        url: '../pay/pay?flag=1&openid=' + self.data.openid + '&postid=' + self.data.postID
                    })
                } else {
                    Auth.checkSession(self, 'isLoginNow');
                }
            } else {
                var src = config.getZanImageUrl;
                wx.previewImage({
                    urls: [src],
                });

            }
        },
        copyLink: function () {
            let that = this;
            if (that.data.websiteURL) {
                console.log(that.data.websiteURL + that.data.articleURL);
                wx.setClipboardData({
                    data: that.data.websiteURL + that.data.articleURL,
                    success: function (res) {
                        wx.showToast({
                            title: '复制成功',
                            icon: 'success',
                            duration: 2000
                        });
                    }
                });
            } else {
                console.log('网站主页域名未设置');
            }
        },
        replay: function (e) {
            let that = this;
            let id = e.target.dataset.id;
            let name = e.target.dataset.name;
            let rid = e.target.dataset.rid;
            let pid = e.target.dataset.pid;
            let commentdate = e.target.dataset.commentdate;
            if (id) {
                that.data.isFocusing = true;
                if (that.data.enableComment) {
                    that.setData({
                        toCommentPid: id,
                        placeholder: "@" + name,
                        focus: true,
                        toCommentRid: rid || id,
                        toUser: name,
                        commentdate: commentdate
                    });

                }
            } else {
                console.log('暂不支持更多嵌套层评论');
            }
            //console.log('toCommentPid', that.data.toCommentPid);
            //console.log('toCommentRid', that.data.toCommentRid);
        },
        onReplyBlur: function (e) {
            let that = this;
            console.log('onReplyBlur');
            that.data.isFocusing = false;
            const text = e.detail.value.trim();
            if (text === '') {
                that._resetInput();
            }
        },
        onRepleyFocus: function (e) {
            console.log('onReplyFocus');
        },
        getLeanCloudACL: function (read, write) {
            let acl = new AV.ACL();
            acl.setPublicReadAccess(read);
            acl.setPublicWriteAccess(write);
            return acl;
        },
        writeComment: function (content, rid, pid, is_reply, to_user, user_info) {
            let that = this;
            // 未存在会创建新表
            let Ct = AV.Object.extend(that.data.commentTabName);
            let commenter = new Ct();
            let commentObj = {};
            let currentDate = new Date();

            commentObj["nick"] = that.data.userInfo.nickName;
            commentObj["mail"] = '';
            commentObj["child"] = []
            commentObj['link'] = '';
            commentObj["url"] = that.data.articleURL;
            commentObj['avatar'] = that.data.userInfo.avatarUrl;
            commentObj['comment'] = content;

            commenter.set('nick', that.data.userInfo.nickName);
            commenter.set('mail', '');
            commenter.set('link', '');
            commenter.set('ua', that.data.uaInfo);
            commenter.set('url', that.data.articleURL);
            commenter.set('comment', `<p>${content}</p>`);
            commenter.set('insertedAt', currentDate);
            if (is_reply) {
                commentObj["pid"] = pid;
                commentObj["rid"] = rid;
                commenter.set('rid', rid);
                commenter.set('pid', pid);
                commenter.set('comment', `<p><a class="at" href="#${pid}">@${to_user} </a> , ${content}</p>`);
            }
            commenter.setACL(that.getLeanCloudACL(true, false));
            const user = AV.User.current();
            let targetUser = AV.Object.createWithoutData('_User', user.id);
            commenter.set('targetUser', targetUser);

            commenter.save().then(ret => {
                if (!is_reply) {
                    that.setData({
                        commentPNum: that.data.commentPNum + 1,
                        commentCountStr: "有" + (that.data.commentCount + 1) + "条评论",
                        commentCount: that.data.commentCount + 1
                    })
                } else {
                    that.setData({
                        commentCountStr: "有" + (that.data.commentCount + 1) + "条评论",
                        commentCount: that.data.commentCount + 1
                    })
                }

                let buildArray = new Array();
                buildArray[0] = ret;
                console.log(buildArray);
                // 子评论需要对已加载评论重新进行评论树构建
                if (is_reply) {
                    that.buildCommentTree(buildArray, true, true);
                } else {
                    that.buildCommentTree(buildArray, true);
                }
            }).catch(ex => {
                wx.showToast({
                    title: '评论发生错误...',
                    icon: 'none',
                    duration: 2000
                })
                console.log(ex.code);
                console.log(ex.message);
                console.log(ex.error);
            });
        },
        // 提交评论
        bindFormSubmit: function (e) {
            let that = this;
            // 判断内容长度是否满足最小要求
            let content = e.detail.value.inputComment;
            if (content.length <= that.data.contentMinLen) {
                wx.showToast({
                    title: '评论内容长度不够^_^',
                    icon: 'none',
                    duration: 2000
                })
                return;
            }

            // 检查授权 & 写入评论
            wx.getSetting({
                success(res) {
                    if (!res.authSetting['scope.userInfo']) {
                        // console.log("没有授权获取用户信息");
                        that.setData({
                            showAurButton: true
                        });
                    } else {
                        // console.log("已经授权获取用户信息，开始获取信息");
                        wx.getUserInfo({
                            success: function (res) {
                                that.data.userInfo = res.userInfo;
                                // LeanCloud 用户一键登录
                                AV.User.loginWithWeapp().then(user => {
                                    if (user.attributes.nickName !=
                                        that.data.userInfo.nickName ||
                                        user.attributes.avatarUrl !=
                                        that.data.userInfo.avatarUrl) {
                                        // 更新LeanCloud用户信息
                                        console.log('更新LeanCloud用户信息');
                                        that._updateUserInfoInLeanCloud();
                                    }
                                    let is_reply = false;
                                    let rid = that.data.toCommentRid;
                                    let pid = that.data.toCommentPid;
                                    let to_user = that.data.toUser;
                                    let user_info = that.data.userInfo;
                                    if (rid || pid) {
                                        is_reply = true;
                                    }
                                    // 写入评论
                                    that.writeComment(content, rid, pid, is_reply, to_user, user_info);
                                }).catch(console.error);
                            }
                        })
                    }
                },
                fail: function () {
                    console.log("获取用户的当前设置失败");
                }
            })

        },
        onReachBottom: function () {
            console.log("达到底部");
            let that = this;
            //console.log(that.data.commentPNum);
            //console.log(that.data.isLastPage);
            if (that.data.commentPNum > 0 && !that.data.isLastPage) {
                that.fetchCommentDetailData(that.data.commentIndex);
                let current_pcomment_showed_num = that.data.commentIndex * that.data.pageSize;
                if (current_pcomment_showed_num < that.data.commentPNum) {
                    that.data.commentIndex = that.data.commentIndex + 1;
                } else {
                    that.setData({
                        isLastPage: true
                    });
                }
            }
        },
        buildCommentTree: function (source, is_wechat = false, is_reply = false, p_key = 'pid', self_key = 'id', child_key = 'child', root_value = undefined) {
            let that = this;
            // 整理数据
            let new_data = [];
            for (let i = 0; i < source.length; i++) {
                let item = {};
                item["id"] = source[i].id;
                item["author_name"] = source[i].attributes.nick;
                item["content"] = source[i].attributes.comment;
                item["date"] = source[i].updatedAt.toLocaleString();
                item["child"] = []
                item["pid"] = source[i].attributes.pid;
                item["rid"] = source[i].attributes.rid;
                item["url"] = source[i].attributes.url;
                // 处理小程序提交评论
                if (source[i].attributes.targetUser) {
                    if (is_wechat && !source[i].attributes.targetUser.attributes.nickName) {
                        item['avatar'] = that.data.userInfo.avatarUrl;
                    } else {
                        item['author_name'] = source[i].attributes.targetUser.attributes.nickName;
                        item['avatar'] = source[i].attributes.targetUser.attributes.avatarUrl;
                    }

                }
                // 正则处理valine评论内容
                if (!item["pid"]) {
                    item["content"] = item["content"].match(/<p>(.*)<\/p>/)[1];

                } else {
                    item["content"] = item["content"].match(/<\/a> , (.*)<\/p>/)[1];
                }

                new_data.push(item);
            }
            // 记录所有原始数据
            if (new_data) {
                that.data.commentsRawList = [].concat(that.data.commentsRawList, new_data);
                //console.log(that.data.commentsRawList);
            }
            if (is_wechat && is_reply) {
                new_data = that.data.commentsRawList;
            }

            // 生成评论树
            let data = JSON.parse(JSON.stringify(new_data));
            for (let i = 0; i < data.length; i++) {
                let item_i = data[i];
                if (item_i[p_key] === root_value) {
                    continue;
                }
                for (let j = 0; j < data.length; j++) {
                    if (i === j) {
                        continue;
                    }
                    let item_j = data[j];
                    if (item_i[p_key] === item_j[self_key]) {
                        if (!item_j[child_key] ||
                            Object.prototype.toString.call(item_j[child_key]) !==
                            '[object Array]'
                        ) {
                            item_j[child_key] = [];
                        }
                        item_j[child_key].push(item_i);
                        break;
                    }
                }
            }
            let tree_data = data.filter(item => item[p_key] === root_value);

            // set data
            if (tree_data) {
                if (is_wechat && !is_reply) {
                    that.setData({
                        commentsList: [].concat(tree_data, that.data.commentsList)
                    });
                } else if (is_wechat && is_reply) {
                    that.setData({
                        commentsList: tree_data
                    })
                } else {
                    that.setData({
                        commentsList: [].concat(that.data.commentsList, tree_data)
                    });
                }
            }
            // 重置输入框状态
            console.log('重置输入框状态');
            that._resetInput();
        },
        fetchCommentDetailData: function (no) {
            let that = this;
            let cq = that._leanQuery(that.data.articleID);
            let size = that.data.pageSize;
            let all_data = [];
            that.setData({
                isLoading: true
            });
            cq.limit(size);
            cq.skip((no - 1) * size);
            cq.include('targetUser');
            cq.find().then(rets => {
                let len = rets.length;
                let rids = []
                for (let i = 0; i < len; i++) {
                    let ret = rets[i];
                    rids.push(ret.id)
                }
                all_data = [].concat(rets);
                // load children comment
                that._leanQuery(that.data.articleID, rids).find().then(ret => {
                    let childs = ret || [];
                    console.log("子评论数：" + childs.length);
                    all_data = all_data.concat(childs);
                    console.log(all_data);
                    that.buildCommentTree(all_data);
                }).catch(ex => {
                    wx.showToast({
                        title: '加载评论错误...',
                        icon: 'none',
                        duration: 2000
                    })
                    console.log(ex.code);
                    console.log(ex.message);
                    console.log(ex.error);
                })
            }).catch(ex => {
                wx.showToast({
                    title: '加载评论出错...',
                    icon: 'none',
                    duration: 2000
                })
                console.log(ex.code);
                console.log(ex.message);
                console.log(ex.error);
            }).finally(function () {
                that.setData({
                    isLoading: false
                });
            });
        },
        getUAInfo: function () {
            let that = this;
            wx.getSystemInfo({
                success: function (res) {
                    if (res.system.includes('Android')) {
                        that.data.uaInfo = "Mozilla/5.0 (" + res.model + ";" + res.system + ";" + res.language + ") AppleWebKit/537.36 MicroMessenger/" + res.version;
                    } else {
                        let system = res.system.replace(/\./g, '_') + " like Mac OS X";
                        that.data.uaInfo = "Mozilla/5.0 (" + res.model + ";" + system + ";" + res.language + ") AppleWebKit/537.36 MicroMessenger/" + res.version;
                    }

                    console.log(that.data.uaInfo);
                },
            })
        },
        fetechPCommentNum: function () {
            let that = this;
            that._leanQuery(that.data.articleID).count().then(num => {
                if (num > 0) {
                    console.log("父评论总数:" + num);
                    that.data.commentPNum = num;
                } else {
                    console.log("暂无评论");
                    that.setData({
                        isLastPage: true
                    })
                }
            }).catch(ex => {
                // https://leancloud.cn/docs/error_code.html#hash1389221
                // first time to create Counter Class
                if (101 == error.code) {
                    // do something
                }
                console.log(ex.code);
                console.log(ex.message);
                console.log(ex.error);
            });
        },
        // 获取评论总数
        fetchCommentCount: function () {
            let that = this;
            let counter_query = new AV.Query(that.data.commentTabName);
            counter_query.equalTo('url', that.data.articleID);
            counter_query.count().then(function (count) {
                console.log('评论总数：' + count);
                if (count && count > 0) {
                    that.setData({
                        commentCountStr: "有" + count + "条评论",
                        commentCount: count
                    });
                }
                // 更新页面计数和评论数及点赞数
                that.updatePageCounter();
            },
                function (error) {
                    console.log(error.message);
                    console.log(error.code);
                    // https://leancloud.cn/docs/error_code.html#hash1389221
                    // first time to create Counter Class
                    if (101 == error.code) {
                        // 没有评论表，评论为0
                        that.setData({
                            isLastPage: true,
                            commentCountStr: "有0条评论"
                        });
                    }
                });
        },
        createPageCounter: function () {
            let that = this;
            // 未存在会创建新表
            let Counter = AV.Object.extend(that.data.counterTabName);
            let newCounter = new Counter();
            newCounter.setACL(that.getLeanCloudACL(true, true));
            newCounter.set('url', that.data.articleID);
            newCounter.set('xid', that.data.articleID);
            newCounter.set('title', that.data.articleTitle);
            newCounter.set('time', 1);
            newCounter.set('comments', that.data.commentCount);
            newCounter.set('likes', that.data.likeCount);
            newCounter.save().then(ret => {
                // nothing to do
                console.log('初始化页面计数表成功');
            }).catch(ex => {
                console.log(ex)
                wx.showToast({
                    title: '创建数据表失败',
                    icon: 'none',
                    duration: 2000
                });
            });
        },
        updatePageCounter: function () {
            let that = this;
            let query = new AV.Query(that.data.counterTabName);
            query.equalTo('url', that.data.articleID);
            query.find().then(ret => {
                console.log(ret);
                if (ret.length > 0) {
                    let v = ret[0];
                    v.increment("time");
                    v.set('comments', that.data.commentCount);
                    v.set('likes', that.data.likeCount);
                    v.save().then(rt => {
                        // 页面计数更新成功
                        console.log('页面计数更新成功');
                    }).catch(ex => {
                        console.log(ex)
                        // 页面计数更新失败
                        console.log('页面计数更新失败');
                    });
                }
            }).catch(ex => {
                console.log(ex.message);
                console.log(ex.code);
                if (ex.code == 101) {
                    console.log('页面计数表未存在，开始创建');
                    that.createPageCounter();
                }
            });
        },
        _resetInput: function () {
            let that = this;
            that.setData({
                toCommentPid: '',
                placeholder: "评论...",
                toCommentRid: '',
                commentdate: "",
                content: '',
                toUser: ''
            });
        },
        _leanQuery: function (k) {
            let that = this;
            let len = arguments.length;
            if (k === 'total') {
                that.fetchCommentCount();
            } else if (len == 1) {
                let notExist = new AV.Query(that.data.commentTabName);
                notExist.doesNotExist('rid');
                let isEmpty = new AV.Query(that.data.commentTabName);
                isEmpty.equalTo('rid', '');
                let q = AV.Query.or(notExist, isEmpty);
                if (k === '*') {
                    q.exists('url');
                } else {
                    q.equalTo('url', decodeURI(k));
                }
                q.addDescending('createdAt');
                q.addDescending('insertedAt');
                return q;
            } else {
                let query = new AV.Query(that.data.commentTabName);
                query.containedIn('rid', arguments[1]);
                query.addDescending('createdAt');
                query.addDescending('insertedAt');
                query.include('targetUser');
                return query;
            }
        },
        _updateUserInfoInLeanCloud: function () {
            // 获得当前登录用户
            let that = this;
            const user = AV.User.current();
            // 调用小程序 API，得到用户信息
            wx.getUserInfo({
                success: ({
                    userInfo
                }) => {
                    // 更新当前用户的信息
                    user.set(userInfo).save().then(user => {
                        // 成功，此时可在控制台中看到更新后的用户信息
                        //this.data.login_user_info = user.toJSON();
                        console.log(user);
                    }).catch(console.error);
                },
                fail: function () {
                    console.log("获取用户信息失败");
                }
            });
        }
    } // end of method
})