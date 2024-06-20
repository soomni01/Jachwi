const db = require("../database/db.js"); // db.js 파일의 경로에 맞게 수정
const bcrypt = require("bcrypt");

exports.commentPost = (req, res) => {
    const { post_id,  author, content } = req.body;

    if (!post_id || !author || !content) {
        return res.status(400).json({ success: false, message: '게시물 ID, 작성자, 내용을 모두 제공해야 합니다.' });
    }

    // 데이터베이스에 댓글 정보 저장
    const sql = 'INSERT INTO comments (post_id, author, content) VALUES (?, ?, ?)';
    db.query(sql, [post_id, author, content], (err, result) => {
        if (err) {
            console.error('데이터베이스에 댓글을 저장하는 중 오류 발생:', err);
            return res.status(500).json({ success: false, message: '댓글을 데이터베이스에 저장하는 중 오류가 발생했습니다.' });
        }

        console.log('댓글을 데이터베이스에 성공적으로 저장했습니다.');
        res.status(201).json({ success: true, message: '댓글이 데이터베이스에 성공적으로 저장되었습니다.' });
    });
};

exports.commentGet=(req, res) => {
    const postId = req.params.id;

    const sql = 'SELECT * FROM comments WHERE post_id = ? AND parent_comment_id IS NULL';
    db.query(sql, [postId], (err, results) => {
        if (err) {
            console.error('Error fetching comments from database:', err);
            return res.status(500).json({ success: false, message: '댓글을 데이터베이스에서 가져오는 중 오류가 발생했습니다.' });
        }

        console.log('댓글을 데이터베이스에서 성공적으로 가져왔습니다.');
        res.status(200).json({ success: true, comments: results });
    });
};

exports.commentDelete = (req, res) => {
    const commentId = req.params.id;

    // 댓글 및 대댓글 삭제 쿼리
    const deleteQuery = `
        DELETE FROM comments
        WHERE parent_comment_id = ?
    `;

    db.query(deleteQuery, [commentId], (err, result) => {
        if (err) {
            console.error('Error deleting comments and recomments from database:', err);
            return res.status(500).json({ success: false, message: '댓글과 대댓글을 데이터베이스에서 삭제하는 중 오류가 발생했습니다.' });
        }

        // 댓글 삭제 쿼리
        const deleteCommentQuery = `
            DELETE FROM comments
            WHERE id = ?
        `;

        db.query(deleteCommentQuery, [commentId], (err, result) => {
            if (err) {
                console.error('Error deleting comment from database:', err);
                return res.status(500).json({ success: false, message: '댓글을 데이터베이스에서 삭제하는 중 오류가 발생했습니다.' });
            }

            console.log('댓글과 대댓글을 데이터베이스에서 성공적으로 삭제했습니다.');
            res.status(200).json({ success: true, message: '댓글과 대댓글이 데이터베이스에서 성공적으로 삭제되었습니다.' });
        });
    });
};

exports.commentUpdate = (req, res) => {
    const commentId = req.params.id;
    const { content } = req.body;

    // 댓글 업데이트 쿼리
    const updateQuery = `
        UPDATE comments
        SET content = ?
        WHERE id = ?
    `;

    db.query(updateQuery, [content, commentId], (err, result) => {
        if (err) {
            console.error('Error updating comment in database:', err);
            return res.status(500).json({ success: false, message: '댓글을 데이터베이스에서 업데이트하는 중 오류가 발생했습니다.' });
        }

        if (result.affectedRows === 0) {
            // 업데이트된 행이 없으면 해당 댓글이 존재하지 않음을 의미합니다.
            return res.status(404).json({ success: false, message: '해당 ID의 댓글을 찾을 수 없습니다.' });
        }

        console.log('댓글을 데이터베이스에서 성공적으로 업데이트했습니다.');
        res.status(200).json({ success: true, message: '댓글이 데이터베이스에서 성공적으로 업데이트되었습니다.' });
    });
};

exports.recommentPost = (req, res) => {
    const { post_id, parent_comment_id, author, content } = req.body;

    if (!post_id || !parent_comment_id || !author || !content) {
        return res.status(400).json({ success: false, message: '게시물 ID, 부모 댓글 ID, 작성자, 내용을 모두 제공해야 합니다.' });
    }

    // 데이터베이스에 대댓글 정보 저장
    const sql = 'INSERT INTO comments (post_id, parent_comment_id, author, content) VALUES (?, ?, ?, ?)';
    db.query(sql, [post_id, parent_comment_id, author, content], (err, result) => {
        if (err) {
            console.error('데이터베이스에 대댓글을 저장하는 중 오류 발생:', err);
            return res.status(500).json({ success: false, message: '대댓글을 데이터베이스에 저장하는 중 오류가 발생했습니다.' });
        }

        console.log('대댓글을 데이터베이스에 성공적으로 저장했습니다.');
        res.status(201).json({ success: true, message: '대댓글이 데이터베이스에 성공적으로 저장되었습니다.' });
    });
};

exports.recommentGet = (req, res) => {
    const parentCommentId = req.params.id;

    const sql = 'SELECT * FROM comments WHERE parent_comment_id = ?';
    db.query(sql, [parentCommentId], (err, results) => {
        if (err) {
            console.error('데이터베이스에서 대댓글을 가져오는 중 오류 발생:', err);
            return res.status(500).json({ success: false, message: '대댓글을 데이터베이스에서 가져오는 중 오류가 발생했습니다.' });
        }

        console.log('대댓글을 데이터베이스에서 성공적으로 가져왔습니다.');
        res.status(200).json({ success: true, recomments: results });
    });
};

exports.recommentDelete = (req, res) => {
    const recommentId = req.params.id;

    const deleteRecommentSql = 'DELETE FROM comments WHERE id = ?';
    db.query(deleteRecommentSql, [recommentId], (err, result) => {
        if (err) {
            console.error('Error deleting recomment from database:', err);
            return res.status(500).json({ success: false, message: '대댓글을 데이터베이스에서 삭제하는 중 오류가 발생했습니다.' });
        }

        console.log('대댓글을 데이터베이스에서 성공적으로 삭제했습니다.');
        res.status(200).json({ success: true, message: '대댓글이 데이터베이스에서 성공적으로 삭제되었습니다.' });
    });
};