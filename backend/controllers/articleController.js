const articleService = require('../services/articleService');
const Category = require('../models/Category'); 
const User = require('../models/User');

// 1. Create Article (Thêm bài viết)
const createArticle = async (req, res) => {
  try {
    const file = req.files?.thumbnails?.[0] || null;

    if (!file) {
      return res.status(400).json({ message: 'No thumbnail uploaded' });
    }

    if (!file.buffer || file.size === 0) {
      return res.status(400).json({ message: 'Thumbnail file is empty or corrupted' });
    }

    // Lấy dữ liệu từ request body
    const { title, slug, summary, content, CategoryID, league_id } = req.body;
    console.log(req.body); // debug

    // Kiểm tra xác thực người dùng
    if (!req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const category = await Category.findById(CategoryID);
    if (!category) {
      return res.status(400).json({ message: 'Category not found' });
    }

    const articleData = {
      title,
      slug,
      summary,
      content,
      CategoryID: category._id,
      UserID: req.user._id,
      league_id: league_id || undefined,
    };

    const article = await articleService.createArticle(articleData, file);

    res.status(201).json({ message: 'Article created successfully', article });
  } catch (error) {
    console.error('Error creating article:', error);
    res.status(500).json({ message: 'Error creating article', error: error.message });
  }
};


// 2. Get All Post Articles (Lấy tất cả bài đăng đã duyệt)
const getAllPostArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = req.query.limit === '0' ? 0 : parseInt(req.query.limit) || 10;
    const keyword = req.query.keyword || ''; // Lấy từ khóa từ query

    const result = await articleService.getAllPostArticles(page, limit, keyword);

    res.status(200).json({
      success: true,
      data: {
        articles: result.articles,
        pagination: limit > 0 ? {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        } : undefined
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching articles',
      error: error.message
    });
  }
};


// 3. Get Article by ID (Lấy thông tin bài báo theo ID)
const getArticleById = async (req, res) => {
  try {
    const article = await articleService.getArticleById(req.params.id);
    res.status(200).json(article);
  } catch (error) {
    if (error.message === 'Article not found') {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error fetching article', error: error.message });
  }
};

// 4. Get Most Viewed Articles (Tin nóng)
const getMostViewedArticles = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default to 10 if not specified

    const result = await articleService.getMostViewedArticles(page, limit);

    res.status(200).json({
      mostViewedArticle: result.articles,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching most viewed articles', error: error.message });
  }
};

// 5. Get Article by Category (Lấy bài báo theo danh mục - Xử lý lỗi mới)
const getArticleByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Default to 10 if not specified

    // Gọi service với categoryId, page, và limit
    const result = await articleService.getArticleByCategory(categoryId, page, limit);

    // Trả về kết quả với cấu trúc mới
    res.status(200).json({
      success: true,
      data: {
        articles: result.articles,
        counts: result.counts,
        totalArticles: result.totalArticles,
        pagination: {
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages,
        },
      },
    });
  } catch (error) {
    if (error.message === 'Category not found') {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({
      success: false,
      message: 'Error fetching articles by category',
      error: error.message,
    });
  }
};

// 6. Get Article by Author (Lấy bài báo theo author_id - Xử lý lỗi mới)
const getArticleByAuthor = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category || '';
    const keyword = req.query.keyword || '';

    const result = await articleService.getArticleByAuthor(
      req.params.authorId,
      page,
      limit,
      category,
      keyword
    );

    res.status(200).json({
      success: true,
      data: {
        articles: result.articles,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      }
    });
  } catch (error) {
    if (error.message === 'User not found' || error.message === 'User is not an author' || error.message.startsWith('Category')) {
      return res.status(404).json({ success: false, message: error.message });
    }
    res.status(500).json({ success: false, message: 'Error fetching articles by author', error: error.message });
  }
};

// 7. Get Article by Published State (Lấy bài báo theo trạng thái duyệt)
const getArticleByPublishedState = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const category = req.query.category || '';
    const keyword = req.query.keyword || '';

    const result = await articleService.getArticleByPublishedState(
      req.params.publishedState,
      page,
      limit,
      category,
      keyword
    );

    res.status(200).json({
      success: true,
      data: {
        articles: result.articles,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching articles by published state',
      error: error.message
    });
  }
};


// 8. Get New Published Articles Statistics (Lấy số lượng bài báo mới trong 15 ngày)
const getNewPublishedArticlesStats = async (req, res) => {
  try {
    const stats = await articleService.getNewPublishedArticlesStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching new articles stats', error: error.message });
  }
};

// 9. Get All Viewed Articles by User (Lấy danh sách bài báo đã đọc của người dùng)
const getAllViewedArticlesByUser = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      console.log('User not authenticated, req.user:', req.user);
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const userId = req.params.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const category = req.query.category || '';
    const keyword = req.query.keyword || '';

    console.log('Request params:', { userId, page, limit, category, keyword });

    if (req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: 'You can only view your own histories' });
    }

    const result = await articleService.getAllViewedArticlesByUser(userId, page, limit, category, keyword);
    console.log('Service result:', result);

    res.status(200).json({
      success: true,
      data: {
        viewedArticles: result.viewedArticles,
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          totalPages: result.totalPages
        }
      }
    });
  } catch (error) {
    console.error('Error in getAllViewedArticlesByUser:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching viewed articles',
      error: error.message
    });
  }
};

// 10. Delete a View History Record (Xóa một lịch sử xem bài báo)
const deleteViewHistory = async (req, res) => {
  try {
    const { historyId } = req.params;
    const userId = req.user._id;
    
    console.log('Deleting historyId:', historyId);
    console.log('For userId:', userId);

    const result = await articleService.deleteViewHistory(historyId, userId);
    res.status(200).json(result);
  } catch (error) {
    console.error('Delete error:', error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

// 11. Get All Post Articles Statistics (Lấy tổng số lượng bài báo đã đăng)
const getAllPostArticlesStats = async (req, res) => {
  try {
    const stats = await articleService.getAllPostArticlesStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching articles stats', error: error.message });
  }
};

// 12. Update Article (Chỉnh sửa bài viết - Chỉ author được phép)
const updateArticle = async (req, res) => {
  try {
    // Lấy dữ liệu từ request
    const { title, slug, summary, content, CategoryID } = req.body;
    const articleData = { title, slug, summary, content };

    // Kiểm tra xác thực người dùng
    if (!req.user?._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Thêm CategoryID vào articleData nếu có
    if (CategoryID) {
      articleData.CategoryID = CategoryID;
    }

    // Lấy file (thumbnail) từ multer
    const file = req.files && req.files.thumbnails ? req.files.thumbnails[0] : null;

    // Gọi service để cập nhật bài viết
    const updatedArticle = await articleService.updateArticle(req.params.id, articleData, req.user, file);

    // Trả về phản hồi thành công
    res.status(200).json({ message: 'Article updated successfully', article: updatedArticle });
  } catch (error) {
    // Kiểm tra lỗi nếu không tìm thấy bài viết hoặc không có quyền
    if (
      error.message === 'Article not found' ||
      error.message === 'Access denied. You are not the author of this article.'
    ) {
      return res.status(403).json({ message: error.message });
    }
    // Lỗi trong quá trình cập nhật
    res.status(500).json({ message: 'Error updating article', error: error.message });
  }
};

  // 13. Delete Article (Xóa bài viết)
  const deleteArticle = async (req, res) => {
    try {
      const result = await articleService.deleteArticle(req.params.id, req.user);
      res.status(200).json(result);
    } catch (error) {
      if (error.message === 'Article not found' || 
          error.message === 'Access denied. You are not the author or an admin.') {
        return res.status(403).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error deleting article', error: error.message });
    }
  };
  
  // 14. Publish Article (Duyệt bài viết)
  const publishArticle = async (req, res) => {
    try {
      // Kiểm tra quyền admin
      if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin role required.' });
      }
  
      const updatedArticle = await articleService.publishArticle(req.params.id);
      res.status(200).json({ message: 'Article published successfully', article: updatedArticle });
    } catch (error) {
      if (error.message === 'Article not found' || error.message === 'Article is already published') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Error publishing article', error: error.message });
    }
  };

  // 15. Ghi lại lịch sử xem bài viết
const recordArticleView = async (req, res) => {
  try {
    // Kiểm tra req.user (được gán bởi authMiddleware)
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const userId = req.user._id;
    const articleId = req.params.id;

    // Gọi service để ghi lại lịch sử xem
    await articleService.recordArticleView(userId, articleId);

    res.status(200).json({ message: 'Article view recorded successfully' });
  } catch (error) {
    if (
      error.message === 'User not found' ||
      error.message === 'Article not found' ||
      error.message === 'Article is not published, view cannot be recorded' ||
      error.message === 'Invalid UserID format' ||
      error.message === 'Invalid ArticleID format'
    ) {
      return res.status(404).json({ message: error.message });
    }
    res.status(500).json({ message: 'Error recording article view', error: error.message });
  }
};

const countPublishedArticlesByAuthor = async (req, res) => {
  try {
    const { userId } = req.params; // Expect userId from URL parameter
    if (!userId) {
      return res.status(400).json({ message: 'Invalid or missing userId' });
    }

    const count = await articleService.countPublishedArticlesByAuthor(userId);
    res.status(200).json({ success: true, count });
  } catch (error) {
    console.error('Error in controller:', error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 17. Get article ID by slug
const getArticleIdBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    if (!slug) {
      return res.status(400).json({ success: false, message: 'Invalid or missing slug' });
    }

    const articleId = await articleService.getArticleIdBySlug(slug);
    res.status(200).json({ success: true, data: { articleId } });
  } catch (error) {
    console.error('Error in getArticleIdBySlug:', error.message);
    res.status(404).json({ success: false, message: error.message });
  }
};

// 18. Get Article by Title (Lấy bài báo theo tiêu đề)
const getArticleByTitle = async (req, res) => {
  try {
    const { title } = req.body; // Lấy tiêu đề từ body

    if (!title) {
      return res.status(400).json({ error: 'Missing title in request body' });
    }

    // Gọi service để tìm kiếm bài báo
    const articles = await articleService.findArticlesByTitle(title);

    if (!articles || articles.length === 0) {
      return res.status(404).json({ message: 'No articles found' });
    }

    res.status(200).json(articles);
  } catch (error) {
    console.error('Error fetching articles by title:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  createArticle,
  getAllPostArticles,
  getArticleById,
  getMostViewedArticles,
  getArticleByCategory,
  getArticleByAuthor,
  getArticleByPublishedState,
  getNewPublishedArticlesStats,
  getAllViewedArticlesByUser,
  deleteViewHistory,
  getAllPostArticlesStats,
  updateArticle,
  deleteArticle,
  publishArticle,
  recordArticleView,
  countPublishedArticlesByAuthor,
  getArticleIdBySlug ,
  getArticleByTitle
};