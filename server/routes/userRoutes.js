const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const boardController = require("../controllers/boardController");
const likeController = require("../controllers/likeController");
const commentContrller = require("../controllers/commentController");
const mypageController = require("../controllers/mypageController");
const findpwController = require("../controllers/findpwController");
const locationController = require("../controllers/deliveryController");
const deliveryController = require("../controllers/deliveryController");
const ChatController = require("../controllers/chatController");
const mainController = require("../controllers/mainController");

// 회원가입 엔드포인트
router.post("/signup", userController.signup);

// 로그인 엔드포인트
router.post("/login", userController.login);

// 중복 확인 라우트
router.post("/checkUsername", userController.checkUsername);

// 로그아웃 라우트
router.post("/logout", userController.logout);

// 로그인 성공 여부 라우트
router.get("/login/success", userController.loginsuccess);

// 비밀번호 찾기
router.post("/reset-password-request", findpwController.findpw);

// 세션 로그인 구현
router.get("/session", userController.session);

// 게시글 데베 저장
router.post("/write12", boardController.post);

// 저장된 데베글 가져오기
router.get("/view/:id", boardController.getPostById);

// 게시글 수정
router.put("/modify/:id", boardController.ModifyPost);

// 게시글 삭제
router.delete("/delete/:id", boardController.deletePostById);

// 게시글 가져오기
router.get("/getPost", boardController.getPosts);

// 내가 작성한 게시글 가져오기
router.post("/my-posts", boardController.getMyPosts);

// 좋아요 추가 또는 취소
router.post("/like", likeController.likePost);

// 좋아요 상태 확인
router.post("/checkLiked", likeController.checkLiked);

// 마이페이지에서 좋아요한 게시물 확인
router.post("/liked-posts", likeController.getLikedPosts);

router.post("/commentPost", commentContrller.commentPost);

router.get("/commentGet/:id", commentContrller.commentGet);

router.post("/recommentPost", commentContrller.recommentPost);

router.get("/recommentGet/:id", commentContrller.recommentGet);

// 닉네임 변경 관련 라우트
router.put("/updateUsername", mypageController.updateUsername);
router.put("/updateLikesUserId", mypageController.updateLikeUser);

//주소 변경
router.put("/updateAddress", mypageController.updateAddress);

// 비밀번호 변경 라우트
router.put("/changePassword", mypageController.changePassword);

// 회원 탈퇴 라우트
router.delete("/withdraw", mypageController.withdraw);

// 댓글,답글
router.post("/commentPost", commentContrller.commentPost);

router.get("/commentGet/:id", commentContrller.commentGet);

router.post("/recommentPost", commentContrller.recommentPost);

router.get("/recommentGet/:id", commentContrller.recommentGet);

router.delete("/commentDelete/:id", commentContrller.commentDelete);

router.put("/commentUpdate/:id", commentContrller.commentUpdate);

router.delete("/recommentDelete/:id", commentContrller.commentDelete);

router.post("/location", locationController.userLocation);

// 공동 배달
router.post("/deliveryPost", deliveryController.deliveryPost);
router.get("/getDeliveryPosts", deliveryController.getDeliveryPosts);
router.delete("/deleteExpiredPosts", deliveryController.deleteExpiredPosts);
router.get("/deliveryView/:post_id", deliveryController.deliveryView);
router.delete("/deleteDelivery/:post_id", deliveryController.deleteDelivery);
router.post("/joinDelivery/:post_id", deliveryController.joinDelivery);
router.get(
  "/userJoinedDelivery/:post_id",
  deliveryController.userJoinedDelivery
);
router.delete("/exitDelivery/:post_id", deliveryController.exitDelivery);
router.put("/editDelivery/:post_id", deliveryController.editDelivery);

//채팅
router.get("/getChatRoom", ChatController.getChatRooms);
router.post("/joinChatRoom", ChatController.joinChatRoom);
router.get("/getUserChatRoom", ChatController.getUserChatRoom);
router.post("/leaveChatRoom", ChatController.leaveChatRoom);
router.get("/roomUsers", ChatController.roomUsers);
router.get("/findChatRoom", ChatController.findChatRoom);
router.get("/CheckUserInChatRoom", ChatController.CheckUserInChatRoom);
router.delete("/deleteChatRoom/:roomId", ChatController.deleteChatRoom);

//메인
// 최신 게시글 가져오기
router.get("/getLatestPosts", mainController.getLatestPosts);
router.get("/getLatestDeliveryPosts", mainController.getLatestDeliveryPosts);

module.exports = router;
