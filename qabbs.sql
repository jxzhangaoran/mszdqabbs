/*
 Navicat Premium Data Transfer

 Source Server         : mysql
 Source Server Type    : MySQL
 Source Server Version : 80013
 Source Host           : localhost:3306
 Source Schema         : qabbs

 Target Server Type    : MySQL
 Target Server Version : 80013
 File Encoding         : 65001

 Date: 27/04/2020 17:02:53
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for agreeornot
-- ----------------------------
DROP TABLE IF EXISTS `agreeornot`;
CREATE TABLE `agreeornot`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `to_evaluate` int(10) NOT NULL COMMENT '被评价的对象的ID',
  `evaluate_type` int(3) NOT NULL COMMENT '被评价的对象类别，0代表回答，1代表文章，2代表问题，3代表文章评论，4代表回答评论',
  `agreeornot` bit(1) NOT NULL COMMENT '0代表不同意（踩），1代表同意（顶）',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `to_evaluate_index`(`to_evaluate`) USING BTREE,
  INDEX `evaluate_type_index`(`evaluate_type`) USING BTREE,
  INDEX `agree_or_not_index`(`agreeornot`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 278 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '保存用户点赞或踩的记录。' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for answer
-- ----------------------------
DROP TABLE IF EXISTS `answer`;
CREATE TABLE `answer`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `which_question` int(10) UNSIGNED NOT NULL COMMENT '问题的ID',
  `answerer` int(10) UNSIGNED NOT NULL COMMENT '回答者的ID',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '回答正文，Markdown格式文本',
  `answer_time` timestamp(0) NOT NULL COMMENT '提交回答的时间',
  `last_update_time` timestamp(0) NULL DEFAULT NULL COMMENT '上次修改的时间',
  `browse_count` int(10) UNSIGNED NOT NULL COMMENT '回答被浏览的次数',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `which_question_index`(`which_question`) USING BTREE,
  INDEX `answerer_index`(`answerer`) USING BTREE,
  FULLTEXT INDEX `answer_fulltext`(`content`) WITH PARSER `ngram`
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '保存用户对问题作出的回答。' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for article
-- ----------------------------
DROP TABLE IF EXISTS `article`;
CREATE TABLE `article`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '文章标题',
  `content` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '文章正文，Markdown格式文本',
  `author` int(10) UNSIGNED NOT NULL COMMENT '发布者用户ID',
  `submit_time` timestamp(0) NOT NULL COMMENT '文章发布的时间',
  `last_update_time` timestamp(0) NULL DEFAULT NULL COMMENT '上次修改的时间',
  `browse_count` int(10) UNSIGNED NOT NULL COMMENT '文章被浏览的次数',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `author_index`(`author`) USING BTREE,
  INDEX `title_index`(`title`) USING BTREE,
  FULLTEXT INDEX `article_fulltext`(`title`, `content`) WITH PARSER `ngram`
) ENGINE = InnoDB AUTO_INCREMENT = 30 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户除提问、回答外，还可以主动发布文章。（博客模块）' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for collection
-- ----------------------------
DROP TABLE IF EXISTS `collection`;
CREATE TABLE `collection`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `collection_id` int(10) UNSIGNED NOT NULL COMMENT '收藏的问题、回答或文章ID',
  `collector` int(10) UNSIGNED NOT NULL COMMENT '收藏者的用户ID',
  `collection_type` int(2) NOT NULL COMMENT '收藏类型，0代表回答、1代表文章、2代表问题',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `collection_id_index`(`collection_id`) USING BTREE,
  INDEX `collector_index`(`collector`) USING BTREE,
  INDEX `collection_type_index`(`collection_type`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 49 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户可以收藏问题、回答或文章。' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for comment
-- ----------------------------
DROP TABLE IF EXISTS `comment`;
CREATE TABLE `comment`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `content` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '评论内容',
  `commentator` int(10) UNSIGNED NOT NULL COMMENT '评论发表者的ID',
  `to_comment` int(10) UNSIGNED NOT NULL COMMENT '被评论的文章或回答ID',
  `to_comment_type` int(2) UNSIGNED NOT NULL COMMENT '被评论的对象类型，0代表回答，1代表文章',
  `comment_time` timestamp(0) NOT NULL COMMENT '评论提交的时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `commentator_index`(`commentator`) USING BTREE,
  INDEX `to_comment_index`(`to_comment`) USING BTREE,
  INDEX `comment_type_index`(`to_comment_type`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 63 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户可以对回答或文章发表评论。' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for follow
-- ----------------------------
DROP TABLE IF EXISTS `follow`;
CREATE TABLE `follow`  (
  `id` int(11) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `to_follow` int(11) UNSIGNED NOT NULL COMMENT '被关注者的ID',
  `follower` int(11) UNSIGNED NOT NULL COMMENT '关注者的ID',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `to_follow_index`(`to_follow`) USING BTREE,
  INDEX `follower_index`(`follower`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 59 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '记录了关注和被关注者的映射。' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for image
-- ----------------------------
DROP TABLE IF EXISTS `image`;
CREATE TABLE `image`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '图片的生成名字',
  `path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '图片的物理路径',
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '图片URL',
  `uploadtime` timestamp(0) NOT NULL COMMENT '上传时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 28 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '发表的文章和回答里包含的图片的信息。' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for invite
-- ----------------------------
DROP TABLE IF EXISTS `invite`;
CREATE TABLE `invite`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增id',
  `inviter` int(11) NOT NULL COMMENT '邀请者的id',
  `be_invited` int(11) NOT NULL COMMENT '被邀请者的id',
  `which_question` int(11) NOT NULL COMMENT '被邀请回答的问题的id',
  `is_read` int(11) NOT NULL COMMENT '是否已读，0代表未读，1代表已读',
  `invite_time` timestamp(0) NULL DEFAULT NULL COMMENT '邀请发出的时间',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `inviter_index`(`inviter`) USING BTREE,
  INDEX `be_invited_index`(`be_invited`) USING BTREE,
  INDEX `which_question_index`(`which_question`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 60 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for question
-- ----------------------------
DROP TABLE IF EXISTS `question`;
CREATE TABLE `question`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `title` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '问题的标题',
  `detail` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '问题的详情，可为空',
  `questioner` int(10) UNSIGNED NOT NULL COMMENT '提问者的用户ID',
  `submit_time` timestamp(0) NOT NULL COMMENT '提问时间',
  `last_update_time` timestamp(0) NULL DEFAULT NULL COMMENT '上次修改的时间',
  `browse_count` int(10) UNSIGNED NOT NULL COMMENT '问题被浏览的次数',
  PRIMARY KEY (`id`) USING BTREE,
  INDEX `questioner_index`(`questioner`) USING BTREE,
  FULLTEXT INDEX `question_fulltext`(`title`, `detail`) WITH PARSER `ngram`
) ENGINE = InnoDB AUTO_INCREMENT = 10 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户提出的问题。' ROW_FORMAT = Dynamic;

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增ID',
  `username` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户名',
  `encrypted_password` varchar(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT 'SHA256加密过的密码，由Java负责加密',
  `email` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '电子邮件',
  `nickname` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '昵称',
  `motto` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '座右铭，或者叫个性签名，可为空',
  `head_photo_path` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '用户头像图片的物理路径，可为空',
  `head_photo_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '用户头像图片的URL，可为空',
  `head_photo_name` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '用户头像图片的生成名称，可为空',
  `register_time` timestamp(0) NOT NULL COMMENT '注册时间',
  `last_login_time` timestamp(0) NULL DEFAULT NULL COMMENT '最后登录时间',
  `last_update_info_time` timestamp(0) NOT NULL COMMENT '上一次修改用户资料时间',
  `last_login_ip` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '上一次登录时的客户端IP',
  PRIMARY KEY (`id`) USING BTREE,
  UNIQUE INDEX `username_index`(`username`) USING BTREE,
  UNIQUE INDEX `email_index`(`email`) USING BTREE,
  INDEX `nickname_index`(`nickname`) USING BTREE,
  INDEX `password_index`(`encrypted_password`) USING BTREE,
  FULLTEXT INDEX `search_index`(`username`, `nickname`) WITH PARSER `ngram`
) ENGINE = InnoDB AUTO_INCREMENT = 26 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '用户信息表。' ROW_FORMAT = Dynamic;

SET FOREIGN_KEY_CHECKS = 1;
